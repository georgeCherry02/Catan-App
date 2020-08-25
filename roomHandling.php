<?php
	include_once "common/base.php";
	include_once "inc/class.worlds.inc.php";
	$world = new World($db);
	$res = $world->allowedIn();
	if ($res[0]) {
		$id = $_POST['roomID'];
		$ver = $res[1];
		header("Location: board.php?id=$id&ver=$ver");
	} else {
		header("Location: main.php");
	}
?>
