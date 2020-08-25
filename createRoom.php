<?php
	include_once "common/base.php";
	include_once "inc/class.worlds.inc.php";
	$world = new World($db);
	if (isset($_SESSION['LoggedIn']) && $_SESSION['LoggedIn'] == 1) {
		$result = $world->createWorld();
	}
	if ($result != FALSE) {
		$id = $result[0];
		$ver = $result[1];
		header("Location: board.php?id=$id&ver=$ver");
	} else {
		header("Location: main.php");
		exit;
	}
?>
