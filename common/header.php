<!DOCTYPE html>
<html>
	<head>
		<title>InsertGameNameHere | <?php echo $pageTitle; ?></title>
		<!--Remember Favicon-->
		<!--Main stylesheet-->
		<link rel='stylesheet' href='css/main.css' type='text/css'/>
		<!--Site functionality scripts-->
		<script src='scripts/siteFunction.js'></script>
		<?php if ($inRoom) { ?>
		<link rel='stylesheet' href='css/board.css' type='text/css'/>
		<link rel='stylesheet' href='css/gui.css' type='text/css'/>
		<!--Add necessary scripts-->
		<!--Perhaps add PHP loop to load in scripts defining building behaviour-->
		<?php } ?>
	</head>	
	<body>
		<div id='page-wrap'>

