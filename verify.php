<?php
	include_once "common/base.php";
	$inRoom = false;
	$pageTitle = "Complete registration";
	include_once "common/header.php";
	if (isset($_GET['ver']) && isset($_GET['n'])) {
		include_once "inc/class.users.inc.php";
		$user = new User($db);
		$result = $user->verifyAccount();
	} else if (isset($_POST['ver'])) {
		include_once "inc/class.users.inc.php";
		$user = new User($db);
		$result = $user->setPassword();
	} else {
		header("Location: main.php");
		exit;
	}

	$r = $result[0];

	if($r == 4) {
		header("Location: main.php");
	} else if ($r != 0) {
		echo $result[1];
	} 
	if ($r == 0 || $r == 3) {
?>
<h2>Choose a password</h2>
<form method='POST' action='verify.php' id='verifyf'>
	<input type='hidden' name='ver' value='<?php echo $_GET['ver']; ?>'/>
	<label for='pass'>Password:</label><br>
	<input type='text' name='pass' id='pass'/><br>
	<label for='cpass'>Confirm Password:</label><br>
	<input type='text' name='cpass' id='cpass'/><br>
	<input type='submit' name='subpass' id='subpass'/>
</form>
<?php
	}
	include_once "common/footer.php";
?>
