<?php
	include_once "common/base.php";
	include_once "inc/class.worlds.inc.php";
	$world = new World($db);

	$wid = $_POST['wid'];
	$ver = $_POST['ver'];
	if ($_POST['to'] == 0) { 
		header("Location: board.php?id=$wid&ver=$ver");
	}
	$world->sendTradeOffer();
	header("Location: board.php?id=$wid&ver=$ver");
?>
