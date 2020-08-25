<?php
	include_once "common/base.php";

	include_once "inc/class.worlds.inc.php";
	$world = new World($db);
	$world->discardCards();
	
	$res = $world->allowedIn();
	$id = $_POST['wid'];
	$ver = $res[1];
	header("Location: board.php?id=$id&ver=$ver");
?>
