<?php
#PAGES
//page_key => array(visible_in_menu, name_in_menu_and_title, subpages)
$DEFINED_PAGES = array(
	'home' => array(0, 'Home'),
	'dictionary' => array(0, 'Dictionary'),
	'reader' => array(0, 'Reader'),
	'logout' => array(1, 'Logout'),
	'error' => array(0, 'Error')
);

if (!isset($_SESSION['login'])) {
	$DEFINED_PAGES = array(
		'home' => array(0, 'Home'),
		'login' => array(1, 'Login'),
		'register' => array(1, 'Register'),
		'reader' => array(0, 'Reader'),
		'error' => array(0, 'Chyba')
	);
}

#ARGS
$ARGS = array();
?>