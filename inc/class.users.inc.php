<?php
	class User {

		private $_db;

		public function __construct($db) {
			$this->_db = $db;
		}

		public function sendVerEmail() {
			$email = $_POST['email'];
			$name = $_POST['name'];
			$time = sha1(time());

			// Check the account's not a duplicate
			$sql = "SELECT COUNT(Email) AS duplicate "
			     . "FROM `players` "
			     . "WHERE Email=:e";
			try {
				$stmt = $this->_db->prepare($sql);
				$stmt->bindParam(":e", $email, PDO::PARAM_STR);
				$stmt->execute();
				$res = $stmt->fetch();
				$stmt->closeCursor();
				if ($res['duplicate'] != 0) {
					return array(1, "email");
				}
			} catch (PDOException $e) {
				return array(2, "db");
			}
			
			$sql = "SELECT COUNT(Username) AS duplicate "
			     . "FROM `players` "
			     . "WHERE Username=:u";
			try {
				$stmt = $this->_db->prepare($sql);
				$stmt->bindParam(":u", $user, PDO::PARAM_STR);
				$stmt->execute();
				$res = $stmt->fetch();
				$stmt->closeCursor();
				if ($res['duplicate'] != 0) {
					return array(1, "username");
				}
			} catch(PDOException $e) {
				return array(2, "db");
			}
			
			// Add unverified account
			$sql = "INSERT INTO `players` "
			     . "(Name, Email, VerCode) "
			     . "VALUES "
			     . "(:n, :e, :v)";
			try {
				$stmt = $this->_db->prepare($sql);
				$stmt->bindParam(":n", $name, PDO::PARAM_STR);
				$stmt->bindParam(":e", $email, PDO::PARAM_STR);
				$stmt->bindParam(":v", $time, PDO::PARAM_STR);
				$stmt->execute();
				$stmt->closeCursor();
			} catch(PDOException $e) {
				return array(2, "db");
			}

			// Send verification email
			$stat = $this->sendEmail($name, $email, $time);
			if ($stat) {
				return array(0, NULL);
			} else {
				return array(2, "mail");
			}
		}

		private function sendEmail($n, $e, $t) {
			$to = $e;
			$subject = "Verify your game account!";
			$headers = <<<MESSAGE
FROM: InsertGameTitleHere <brynmor99@gmail.com>
Content-Type: text/plain;
MESSAGE;
			$msg = <<<EMAIL
Follow this link to verify your account:
http://localhost/catan/verify.php?ver=$t&n=$n

Any questions please send them back this isn't a no reply email,

Catan Website
EMAIL;
			mail($to, $subject, $msg, $headers);
			return true;
		}

		public function verifyAccount() {
			$v = $_GET['ver'];
			$n = $_GET['n'];
			$sql = "SELECT ID "
			     . "FROM `players` "
			     . "WHERE VerCode=:ver "
			     . "AND Name=:n "
			     . "AND Verified=0 "
			     . "LIMIT 1";
			try {
				$stmt = $this->_db->prepare($sql);
				$stmt->bindParam(":ver", $v, PDO::PARAM_STR);
				$stmt->bindParam(":n", $n, PDO::PARAM_STR);
				$stmt->execute();
				$res = $stmt->fetch();
				$stmt->closeCursor();
				if (isset($res['ID'])) {
					$_SESSION['ID'] = $res['ID']; 
					$_SESSION['LoggedIn'] = 1;
				} else {
					return array(2, "<h2>Verification error!</h2><br><p>It looks like this account has already been verified? Perhaps try logging in, if this fails send us an email</p>");
				}
			} catch(PDOException $e) {
				return array(1, "<h2>Database Error</h2><br><p>Something went wrong... Please try again</p>");
			}
			return array(0, NULL);
		}

		public function setPassword() {
			if (!(isset($_POST['pass']) && isset($_POST['cpass']) && ($_POST['pass'] == $_POST['cpass']))) {
				return array(3, "<h2>Passwords do not match or were not set.</h2><br><p>Please try again.</p>");
			}
			$v = $_POST['ver'];
			$p = $_POST['pass'];
			$sql = "UPDATE `players` "
			     . "SET Password=MD5(:pass), Verified=1 "
			     . "WHERE VerCode=:ver "
			     . "LIMIT 1";
			try {
				$stmt = $this->_db->prepare($sql);
				$stmt->bindParam(":pass", $p, PDO::PARAM_STR);
				$stmt->bindParam(":ver", $v, PDO::PARAM_STR);
				$stmt->execute();
				$stmt->closeCursor();
			} catch(PDOException $e) {
				return array(1, "<h2>Database Error</h2><br><p>Something went wrong... Please try again</p>");
			}
			return array(4, NULL);
		}

		public function login() {
			$n = $_POST['name'];
			$p = $_POST['pass'];

			$sql = "SELECT ID FROM `players` "
			     . "WHERE Name=:name "
			     . "AND Password=MD5(:pass) "
			     . "LIMIT 1";
			try {
				$stmt = $this->_db->prepare($sql);
				$stmt->bindParam(":name", $n, PDO::PARAM_STR);
				$stmt->bindParam(":pass", $p, PDO::PARAM_STR);
				$stmt->execute();
				$res = $stmt->fetch();
				$stmt->closeCursor();
			} catch(PDOException $e) {
				return 1;
			}

			if ($res['ID'] != NULL) {
				$_SESSION['ID'] = $res['ID'];
				$_SESSION['LoggedIn'] = 1;
				return 0;
			} else {
				return 2;
			}
		}

		public function determinePlayer($id, $turn) {
			$sql = "SELECT Players FROM `worlds` "
			     . "WHERE ID=:id";
			try {
				$stmt = $this->_db->prepare($sql);
				$stmt->bindParam(":id", $id, PDO::PARAM_STR);
				$stmt->execute();
				$res = $stmt->fetch();
				$stmt->closeCursor();
			} catch (PDOException $e) {
				return false;
			}

			$list = $res['Players'];
			$p = json_decode($list);

			$pnum = sizeof($p);
			if (($turn <= $pnum * 2) && ($turn > $pnum)) {
				$t = ($turn + $pnum) % $pnum;
			} else {
				$t = ($turn + $pnum - 1) % $pnum;
			}
			$currentPlayerID = $p[$t];

			if ($currentPlayerID == $_SESSION['ID']) {
				return "You";
			}

			$sql = "SELECT Name FROM `players` "
			     . "WHERE ID=:id";
			try {
				$stmt = $this->_db->prepare($sql);
				$stmt->bindParam(":id", $currentPlayerID, PDO::PARAM_STR);
				$stmt->execute();
				$res = $stmt->fetch();
				$stmt->closeCursor();
			} catch (PDOException $e) {
				return false;
			}

			return $res['Name'];
		}
	}
?>
