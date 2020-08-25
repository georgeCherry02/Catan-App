<?php
	// Obtain DB connection
	include_once "../inc/constants.inc.php";
	include_once "../common/base.php";

	// Get ID
	$pid = $_GET['id'];

	// Create SQL Query
	$sql = "SELECT Name FROM `players` "
	     . "WHERE ID=:id";

	// Send SQL Query
	try {
		$stmt = $db->prepare($sql);
		$stmt->bindParam(":id", $pid, PDO::PARAM_STR);
		$stmt->execute();
		$res = $stmt->fetch();
		$stmt->closeCursor();
	} catch (PDOException $e) {
		return false;
	}
	echo $res['Name'];
?>
