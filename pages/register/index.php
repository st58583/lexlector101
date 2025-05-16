<?php
if (post()) {
	p2d('username');
	p2d('email');
	p2d('password1');
	p2d('password2');
	
	if (!filter_var(data('email'), FILTER_VALIDATE_EMAIL)) set_error('email', ui_lang('email_invalid', 'Invalid email format'));
	if (data('password1') !== data('password2')) set_error('password2', ui_lang('password_mismatch', 'Passwords do not match'));
	if (!data('password1')) set_error('password1');
	if (!data('password2')) set_error('password2');
	if (!data('username')) set_error('username');
	
	$res = sql("SELECT usr_email FROM users WHERE usr_email = '". data('email') ."'");
	if ($row = sql_obj($res)) set_error('email', ui_lang('email_registered', 'This temail is already registered'));
	
	$res = sql("SELECT usr_email FROM users WHERE usr_username = '". data('username') ."'");
	if ($row = sql_obj($res)) set_error('username', ui_lang('username_used', 'Username already in use'));
	
	if (!$ERROR) {
		sql("INSERT INTO users SET usr_username = '". data('username') ."', usr_email = '". data('email') ."', usr_password = '". password_hash(data('password1'), PASSWORD_BCRYPT) ."'");
		success(ui_lang('registration_success', 'Registration successful, you can log in now.'));
		
		location('/lexlector/register/');
	}
}


$TITLE = ui_lang('register', 'Register');

if (login()) location('/lexlector/');

print '<div style="box-shadow: 0 0 5px rgba(0,0,0,0.5); font-family: Georgia; line-height: 1.2; background: #3461A8; color: #ccc; margin: 10px; border-radius: 10px; box-sizing: border-box; padding: 20px; overflow-y: scroll; -ms-overflow-style: none; scrollbar-width: none; width: 600px; max-width: calc(100vw - 20px);">';
print show_message();
print '<h2 class="m10">'. $TITLE .'</h2>';
print '<form method="post">';
print row_input('username', ui_lang('username', 'Username'));
print row_input('email', 'Email');
print row_password('password1', ui_lang('password', 'Password'));
print row_password('password2', ui_lang('password_again', 'Password again'));
print button('', ui_lang('register', 'Register'), $class = 'm10');
print '</form>';
print '</div>';
?>