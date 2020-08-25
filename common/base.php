<?php
//	error_reporting(E_ALL);
//	ini_set("error_reporting", E_ALL);
	error_reporting(E_ERROR | E_PARSE);

	session_start();

	include_once "inc/constants.inc.php";

	$dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME;
	$db = new PDO($dsn, DB_USER, DB_PASS);
?>
