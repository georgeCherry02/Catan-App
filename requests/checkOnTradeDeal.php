<?php
	include_once "../inc/constants.inc.php";
	include_once "../common/base.php";

	$wid = $_GET['wid'];

	$sql = "SELECT TradeRequest FROM `worlds` "
	     . "WHERE ID=:id";

	try {
		$stmt = $db->prepare($sql);
		$stmt->bindParam(":id", $wid, PDO::PARAM_STR);
		$stmt->execute();
		$res = $stmt->fetch();
		$stmt->closeCursor();
	} catch (PDOException $e) {
		return false;
	}

	echo $res['TradeRequest'];
?>
