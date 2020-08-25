<?php
	include_once "common/base.php";
	include_once "inc/class.worlds.inc.php";
	$world = new World($db);
	include_once "inc/class.users.inc.php";
	$user = new User($db);
	if (isset($_GET['id'])) {
		$id = $_GET['id'];
		$ver = $_GET['ver'];
	} else {
		$id = $_POST['id'];
		$ver = $_POST['ver'];
	}
	$pageTitle = "Room " . $id;
	$inRoom = TRUE;
	include_once "common/header.php";
?>
	<div class='invisible' id='pop-msg'></div>
	<div id='inventory'>
		<div id='resInv'></div>
		<div id='cardInv'></div>
	</div>
	<div id='turn-info'>
		<div id='player-turn'>
<?php
			$turn = $world->fetchTurnInfo($id);
			$player = $user->determinePlayer($id, $turn);
			echo $player;
?>
		</div>
		<div id='sub-turn'>
			<div class='turn-state' id='roll'>Roll</div>
			<div class='turn-state' id='trade'>Trade</div>
			<div class='turn-state' id='build'>Build</div>
		</div>
		<div onclick='progressTurn()' id='prog-turn'>Progress turn</div>
	</div>
	<div id='board'></div>
	<div id='diceRoll'></div>
	<div id='actionPanel'>
		<div id='buyPanel'>
			<div onclick='action(this.id)' class='actionButton invisible' id='buildRoad'>Road</div>
			<div onclick='action(this.id)' class='actionButton invisible' id='buildSettle'>Settle</div>
			<div onclick='action(this.id)' class='actionButton invisible' id='buildCity'>City</div>
			<div onclick='action(this.id)' class='actionButton' id='buyCard'>Card</div>
		</div>
	</div>
	<div id='stealInfo' class='data'></div>
	<div id='tradeInfo' class='data'></div>
	<script src='scripts/game/constants.js'></script>
	<script src='scripts/game/player.js'></script>
	<script src='scripts/game/coreVariables.js'></script>
	<script src='scripts/game/boardgen.js'></script>
	<script src='scripts/game/populategui.js'></script>
	<script src='scripts/game/core.js'></script>
	<script src='scripts/game/infoRequests.js'></script>
	<script src='scripts/game/eventListeners.js'></script>
	<script src='scripts/httpReq.js'></script>
<!--	<script src='scripts/game/test.js'></script> -->
	<div class='data'>
		<div id='worldID'><?php
			echo $id;
		?></div>
		<div id='playerID'><?php
			echo $_SESSION['ID'];
		?></div>
		<div id='players'><?php
			echo $world->fetchPlayers($id);
		?></div>
		<div id='boardState'><?php
			echo $world->fetchBoardState($id, $ver);
		?></div>
		<div id='playerInventory'><?php
			echo $world->fetchPlayerInventory($id);
		?></div>
		<div id='turn'><?php
			echo $turn;
		?></div>
		<div id='ver'><?php
			echo $ver; 
		?></div>
	</div>
	<script>initData()</script>
	<script>genBoard()</script>
	<script>populateGUI()</script>
	<script>runGame()</script>
<!--	<script>test()</script> -->
<?php
	include_once "common/footer.php";
?>
