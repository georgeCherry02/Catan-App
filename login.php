<?php
	include_once "common/base.php";
	include_once "inc/class.users.inc.php";
	$user = new User($db);
	$stat = $user->login();
	switch ($stat) {
	case 0:
		header("Location: main.php");
		break;
	case 1:
		header("Location: main.php?err=db");
		break;
	case 2:
		header("Location: main.php?det=false");
		break;
	}
?>

