<?php
$lang = $_SESSION['lang'];
session_destroy();
session_start();
$_SESSION['lang'] = $lang;

location('/lexlector/');
?>