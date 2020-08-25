<?php
	// Obtain DB connection
	include_once "../inc/constants.inc.php";
	include_once "../common/base.php";

	// Gather information
	$wid = $_GET['wid'];
	$sids = $_GET['IDs'];

	// Create SQL Query
	$sql = "UPDATE `worlds` "
	     . "SET StealIDs=:sids "
	     . "WHERE ID=:wid";

	// Send Query
	try {
		$stmt = $db->prepare($sql);
		$stmt->bindParam(":sids", $sids, PDO::PARAM_STR);
		$stmt->bindParam(":wid", $wid, PDO::PARAM_STR);
		$stmt->execute();
		$stmt->closeCursor();
	} catch (PDOException $e) {
		return false;
	}
?>
