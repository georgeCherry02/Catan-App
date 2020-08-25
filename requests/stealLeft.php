<?php
	// Obtain DB connection
	include_once "../inc/constants.inc.php";
	include_once "../common/base.php";

	// Get information
	$wid = $_GET['wid'];

	// Create SQL Query
	$sql = "SELECT StealIDs FROM `worlds` "
	     . "WHERE ID=:wid";

	// Send SQL Query
	try {
		$stmt = $db->prepare($sql);
		$stmt->bindParam(":wid", $wid, PDO::PARAM_STR);
		$stmt->execute();
		$res = $stmt->fetch();
		$stmt->closeCursor();
	} catch (PDOException $e) {
		return false;
	}
	echo $res['StealIDs'];
?>
