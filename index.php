<?php
session_start();

include ('./conf/config.php');
include ('./conf/pages.php');
include ('./conf/common.php');
include ('./lib/library.php');

//print_read(get_defined_vars());

sql_connect();

$PAGE = get_page($_SERVER['REQUEST_URI']);
$LANG = language_selection();
ob_start();
$PAGE_FILE = (g_arg(0) && file_exists('./pages/'. $PAGE .'/'. g_arg(0) .'.php')) ? g_arg(0) : 'index';
include('./pages/'. $PAGE .'/'. $PAGE_FILE .'.php');
$CONTENT = ob_get_clean();

$MENU = menu($DEFINED_PAGES);
$NAVIGATION = breadcrumb_navigation($PAGE);

print template(array("TITLE" => 'LexLector | '. $TITLE, "CONTENT" => $CONTENT, "SERVER" => SERVER, "MENU" => $MENU, "NAVIGATION" => $NAVIGATION, "LANG" => $LANG));

sql_close();
?>