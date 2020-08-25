<?php
	// Obtain DB connection
	include_once "../inc/constants.inc.php";
	include_once "../common/base.php";

	// Gather information
	$wid = $_GET['world_id'];
	$inv = $_GET['inventory']; 
	$boardState = $_GET['board_state'];
	$tnum = $_GET['turn_num'] + 1;

	// Create SQL Query
	$sql = "UPDATE `worlds` "
	     . "SET Board_State=:bs, "
	     . "Inventories=:inv, "
	     . "Turn=:tnum "
	     . "WHERE ID=:id";

	// Send SQL Query 
	try {
		$stmt = $db->prepare($sql);
		$stmt->bindParam(":bs", $boardState, PDO::PARAM_STR);
		$stmt->bindParam(":inv", $inv, PDO::PARAM_STR);
		$stmt->bindParam(":tnum", $tnum, PDO::PARAM_STR);
		$stmt->bindParam(":id", $wid, PDO::PARAM_STR);
		$stmt->execute();
		$stmt->closeCursor();
	} catch (PDOException $e) {
		return false;
	}
?>
