<?php
	include_once "common/base.php";
	$inRoom = FALSE;
	$pageTitle = "Welcome";
	include_once "common/header.php";
	if (isset($_SESSION['LoggedIn']) && $_SESSION['LoggedIn'] == TRUE) {
?>
	<a onclick='revealForm(this.id)' id='create'>Create room</a>
	<form method='POST' action='createRoom.php' class='invisible' id='createf'>
		<label for='player2'>Player IDs to invite:</label><br>
		<input type='text' name='player2' id='player2'/>
		<input type='text' name='player3' id='player2'/>
		<input type='text' name='player4' id='player2'/>
		<input type='submit' value='Generate'/>
	</form>
	<a onclick='revealForm(this.id)' id='join'>Join room</a>
	<form method='POST' action='roomHandling.php' class='invisible' id='joinf'>
		<label for='roomID'>Room ID:</label><br>
		<input type='text' name='roomID' id='roomID'/><br>
		<input type='submit'/>
	</form>
<?php 	
	} else {
		if (isset($_GET['dup'])) {
			echo "<h2>An account with this " . $_GET['dup'] . " already exists</h2>";
		} else if (isset($_GET['err'])) {
			echo "<h2>Something went very weird</h2>";
		} else if (isset($_GET['det'])) {
			if ($_GET['det'] == 'false') {
				echo "<h2>Incorrect login details</h2>";
			}
		}
 ?>
	<a onclick="revealForm(this.id)" id='signup'>Register</a>
	<form method='POST' action='signup.php' class='invisible' id='signupf'>
		<label for='email'>Email: </label><br>
		<input type='text' name='email' id='email'/><br>
		<label for='name'>Username: </label><br>
		<input type='text' name='name' id='name'/><br>
		<input type='submit'/>
	</form>
	<a onclick="revealForm(this.id)" id='login'>Login</a>
	<form method='POST' action='login.php' class='invisible' id='loginf'>
		<label for='name'>Username: </label><br>
		<input type='text' name='name' id='name'/><br>
		<label for='pass'>Password: </label><br>
		<input type='text' name='pass' id='pass'/><br>
		<input type='submit'/>
	</form>
<?php
	}
	include_once "common/footer.php";
?>
