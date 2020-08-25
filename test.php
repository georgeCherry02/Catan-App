<?php
	include_once "common/base.php";
	include_once "inc/class.worlds.inc.php";
	$world = new World($db);
	$res = $world->createWorld();
	include_once "common/header.php";
	foreach($res as $r) {
		echo $r;
		echo "|";
	}
	include_once "common/footer.php";
?>
