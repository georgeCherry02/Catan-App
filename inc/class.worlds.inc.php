<?php
	class World {

		private $_db;

		public function __construct($db) {
			$this->_db = $db;
		}

		public function createWorld() {
			$addPlayers = array($_POST['player2']);
			if ($_POST['player3'] != "") {
				array_push($addPlayers, $_POST['player3']);
			}
			if ($_POST['player4'] != "") {
				array_push($addPlayers, $_POST['player3']);
			}
			$list = "[" . $_SESSION['ID']; 
			foreach ($addPlayers as $p) {
				$list .= ", " . $p;
			}
			$list .= "]";
			$ver = sha1(time());
			array_push($addPlayers, $_SESSION['ID']);
			$boardState = $this->createBoard($addPlayers); 
			$inventory = $this->defaultInv($addPlayers);

			// Add world to table
			$sql = "INSERT INTO `worlds` "
			     . "(Players, VerCode, Board_State, Inventories) "
			     . "VALUES "
			     . "(:l, :ver, :b, :inv)";
			try {
				$stmt = $this->_db->prepare($sql);
				$stmt->bindParam(":l", $list, PDO::PARAM_STR);
				$stmt->bindParam(":ver", $ver, PDO::PARAM_STR);
				$stmt->bindParam(":b", $boardState, PDO::PARAM_STR);
				$stmt->bindParam("inv", $inventory, PDO::PARAM_STR);
				$stmt->execute();
				$stmt->closeCursor();
			} catch (PDOException $e) {
				return false;
			}

			// Fetch ID of world
			$sql = "SELECT ID from `worlds` "
			     . "WHERE VerCode=:v "
			     . "LIMIT 1";
			try {
				$stmt = $this->_db->prepare($sql);
				$stmt->bindParam(":v", $ver, PDO::PARAM_STR);
				$stmt->execute();
				$res = $stmt->fetch();
				$stmt->closeCursor();
			} catch (PDOException $e) {
				return false;
			}
			
			$this->alertPlayers($addPlayers, $res['ID']);

			return array($res['ID'], $ver);
		}
	
		public function fetchBoardState($id, $ver) {
			$sql = "SELECT Board_State FROM `worlds` "
			     . "WHERE VerCode=:v "
			     . "AND ID=:id;";
			try {
				$stmt = $this->_db->prepare($sql);
				$stmt->bindParam(":v", $ver, PDO::PARAM_STR);
				$stmt->bindParam(":id", $id, PDO::PARAM_STR);
				$stmt->execute();
				$res = $stmt->fetch();
				$stmt->closeCursor();
			} catch (PDOException $e) {
				return false;
			}
			return $res['Board_State'];
		}

		public function fetchPlayerInventory($id) {
			// Get all inventories
			$sql = "SELECT Inventories FROM `worlds` "
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

			// Return only player inventory
			return $res['Inventories'];
		}

		public function fetchTurnInfo($id) {
			$sql  = "SELECT Turn FROM `worlds` "
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
			return $res['Turn'];
		}

		public function allowedIn() {
			$userID = "%" . $_SESSION['ID'] . "%";
			if (isset($_POST['roomID'])) {
				$roomID = $_POST['roomID'];
			} else if (isset($_POST['wid'])) {
				$roomID = $_POST['wid'];
			}
			$sql = "SELECT VerCode FROM `worlds` "
			     . "WHERE ID=:rid "
			     . "AND Players LIKE :uid";
			try {
				$stmt = $this->_db->prepare($sql);
				$stmt->bindParam(":rid", $roomID, PDO::PARAM_STR);
				$stmt->bindParam(":uid", $userID, PDO::PARAM_STR);
				$stmt->execute();
				$res = $stmt->fetch();
				$stmt->closeCursor();
			} catch (PDOException $e) {
				return array(false, NULL);
			}
			return array(true, $res['VerCode']);
		}

		public function fetchPlayers($id) {
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
			return $res['Players'];
		}

		private function createBoard($players) {
			//Wood, Brick, Sheep, Wheat, Ore, Desert
			$numRes = array(4, 3, 4, 4, 3, 1);
			$resourceDistribution = $this->distribute($numRes);
			$numNum = array(1, 2, 2, 2, 2, 2, 2, 2, 2, 1);
			$numberDistribution = $this->distribute($numNum);
			$fixedNumberDistribution = array();
			foreach ($numberDistribution as $n) {
				if ($n <= 4) {
					$n += 2;
				} else {
					$n += 3;
				}
				array_push($fixedNumberDistribution, $n);
			}
			return $this->distributionToJSON($resourceDistribution, $fixedNumberDistribution, $players);
		}	

		private function distribute($things) {
			$dist = array();
			$total = 0;
			foreach ($things as $thing) {
				$total += $thing;
			}
			for ($i = $total; $i >= 1; $i--) {
				$rand = rand(1, $i);
				for ($j = 0; $j < sizeof($things); $j++) {
					if (!($rand <= $things[$j])) {
						$rand -= $things[$j];
					} else {
						array_push($dist, $j);
						$things[$j] = $things[$j] - 1;
						break;
					}
				}
			}
			return $dist;
		}
		
		private function distributionToJSON($res, $num, $players) {
			$string = "{ \"res\" : [";
			for ($i = 0; $i < sizeof($res); $i++) {
				if ($res[$i] == 5) {
					$desIndex = $i;
				}
				$string .= $res[$i];
				if ($i != sizeof($res) - 1) {
					$string .= ", ";
				} else {
					$string .= "], \"num\" : [";
				}
			}
			for ($i = 0; $i < sizeof($num); $i++) {
				$string .= $num[$i];
				if ($i != sizeof($num) - 1) {
					$string .= ", ";
				} else {
					$string .= "], ";
				}
			}
			$string .= "\"build\" : {";
			foreach ($players as $player) {
				$string .= "\"" . $player . "\" : {"
					 . "\"roads\" : [], "
					 . "\"settles\" : [], "
					 . "\"cities\" : []}";
				if ($player != $players[sizeof($players)-1]) {
					$string .= ", ";
				}
			}
			// Knight, Victory Point, Road Building, Monopoly, Year of Plenty
			$string .= "}, \"devCardList\" : " 
				 . "[14, 5, 2, 2, 2],";
			$string .= "\"robberLoc\":$desIndex}";
			return $string;
		}

		private function defaultInv($players) {
			$string = "{";
			foreach ($players as $player) {
				$string .= "\"" . $player . "\" : {"
					 . "\"res\" : [0, 0, 0, 0, 0], "
					 . "\"card\" : []}";
				if ($player != $players[sizeof($players)-1]) {
					$string .= ", ";
				}
			}
			$string .= "}";
			return $string;
		}

		function discardCards() {
			// Gather information
			$resTypes = array("wood", "brick", "sheep", "wheat", "ore");
			$res = array();
			for ($i = 0; $i < 5; $i++) {
				array_push($res, $_POST[$resTypes[$i]]);
			}
			$pid = $_POST['pid'];
			$wid = $_POST['wid'];

			// Correct inventory
			// Fetch initial inventory
			$sql = "SELECT Inventories FROM `worlds` "
			     . "WHERE ID=:id";
			try {
				$stmt = $this->_db->prepare($sql);
				$stmt->bindParam(":id", $wid, PDO::PARAM_STR);
				$stmt->execute();
				$result = $stmt->fetch();
				$stmt->closeCursor();
			} catch (PDOException $e) {
				return false;
			}
			
			// Make correction
			$inventories = json_decode($result['Inventories']);
			for ($i = 0; $i < 5; $i++) {
				$initVal = $inventories->{$pid}->{'res'}[$i];
				$newVal = $initVal - $res[$i];
				$inventories->{$pid}->{'res'}[$i] = $newVal;
			}
			$jsInv = json_encode($inventories);

			// Update StealIDs
			// Fetch initial StealIDs
			$sql = "SELECT StealIDs FROM `worlds` "
			     . "WHERE ID=:id";
			try {
				$stmt = $this->_db->prepare($sql);
				$stmt->bindParam(":id", $wid, PDO::PARAM_STR);
				$stmt->execute();
				$result = $stmt->fetch();
				$stmt->closeCursor();
			} catch (PDOException $e) {
				return false;
			}

			// Make correction
			$sids = json_decode($result['StealIDs']);
			array_splice($sids, array_search($sids, $pid), 1); 
			$jsSids = json_encode($sids);

			// Update database
			$sql = "UPDATE `worlds` "
			     . "SET Inventories=:inv, "
			     . "StealIDs=:sids "
			     . "WHERE ID=:id";
			try {
				$stmt = $this->_db->prepare($sql);
				$stmt->bindParam(":inv", $jsInv, PDO::PARAM_STR);
				$stmt->bindParam(":id", $wid, PDO::PARAM_STR);
				$stmt->bindParam(":sids", $jsSids, PDO::PARAM_STR);
				$stmt->execute();
				$stmt->closeCursor();
			} catch (PDOException $e) {
				return false;
			}
		}

		function sendTradeOffer() {
			$type = $_POST['type'];
			$from = $_POST['from'];
			$to = $_POST['to'];
			$wid = $_POST['wid'];

			$resTypes = array("wood", "brick", "sheep", "wheat", "ore");
			$requested = array();
			$offered = array();
			foreach ($resTypes as $type) {
				array_push($requested, $_POST[$type . 'Requested']);
				array_push($offered, $_POST[$type . 'Offered']);
			}

			$tr = $this->assembleTradeOffer($type, $from, $to, $requested, $offered);

			$sql = "UPDATE `worlds` "
			     . "SET TradeRequest=:tr "
			     . "WHERE ID=:id";
			try {
				$stmt = $this->_db->prepare($sql);
				$stmt->bindParam(":tr", $tr, PDO::PARAM_STR);
				$stmt->bindParam(":id", $wid, PDO::PARAM_STR);
				$stmt->execute();
				$stmt->closeCursor();
			} catch (PDOException $e) {
				return false;
			}
		}

		private function assembleTradeOffer($type, $from, $to, $req, $off) {
			$msg  = "{\"type\":\"" . $type . "\",\"from\":$from,\"to\":$to,";
			$msg .= "\"req\":" . json_encode($req) . ",\"off\":" . json_encode($off) . "}";
			return $msg;
		}

		private function alertPlayers($players, $id) {
			foreach ($players as $p) {
				// Fetch Username
				$sql = "SELECT Name, Email "
				     . "FROM `worlds` "
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
				$to = $res['Email'];
				$n = $res['Name'];
				$subject = "You've been invited to a game of Catan!";
				$headers = <<<MESSAGE
FROM: Catan <brynmor99@gmail.com>
Content-Type: text/plain;
MESSAGE;
				$msg = <<<EMAIL
Hey $n, 

You've been invited to a game, go to http://localhost/catan/main.php
And join room $id, enjoy!

Catan Website
EMAIL;
				mail($to, $subject, $msg, $headers);
			}
		}
	}
?>
