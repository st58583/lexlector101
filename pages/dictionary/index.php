<?php
if (post()) {
	p2d('username');
	p2d('password');
	
	$res = sql("SELECT usr_id, usr_password, usr_lang FROM users WHERE (usr_username = '". data('username') ."' OR usr_email='". data('username') ."')");
	if ($row = sql_obj($res)) if (password_verify(data('password'), $row->usr_password)) {
		$_SESSION['login'] = $row->usr_id;
		$_SESSION['lang'] = $row->usr_lang;
		sql("UPDATE users SET usr_lastlogin_dt = NOW() WHERE usr_id = '". $row->usr_id ."'");
	}
	
	set_error('username', 'User does not exist');
	set_error('password');
}


$TITLE = 'Login';

if (login()) location('/lexlector/');

print '<div style="box-shadow: 0 0 5px rgba(0,0,0,0.5); font-family: Georgia; line-height: 1.2; background: #3461A8; color: #ccc; margin: 10px; border-radius: 10px; box-sizing: border-box; padding: 20px; overflow-y: scroll; -ms-overflow-style: none; scrollbar-width: none; width: 600px; max-width: calc(100vw - 20px);">';
print show_message();
print '<h2 class="m10">'. $TITLE .'</h2>';
print '<form method="post">';
print row_input('username', 'Username');
print row_password('password', 'Password');	
print button('', 'Log in', $class = 'm10');
print '</form>';
print '</div>';
?>