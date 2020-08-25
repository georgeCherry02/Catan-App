<?php
	include_once "common/base.php";
	include_once "inc/class.users.inc.php";
	$user = new User($db);

	if (isset($_POST['email']) && isset($_POST['name'])) {
		$res = $user->sendVerEmail();
	} else {
		header("Location: welcome.php");
	}

	switch ($res[0]) {
	case 1:
		$dup = $res[1];
		header("Location: main.php?dup=$dup");
		break;
	case 2:
		$err = $res[1];
		header("Location: main.php?err=$err");
		break;
	default:
		$pageTitle = 'Register';
		$inRoom = False;
		include_once "common/header.php";
?>
<h2>A verification email will have been sent to you</h2>
<h3>Please follow that link</h3>
<?php
		include_once "common/footer.php";
	}
?>
