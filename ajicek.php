<?php
session_start();
require('./conf/config.php');
include('./lib/library.php');

//header("Content-Type: application/json; charset: utf-8");
header("Content-Type: text/html; charset: utf-8");

sql_connect();

$args = explode('/', g_get("args"));
$cat = $args[0] ?? false;
$id = $args[1] == "dd_value" ? $args[2] : false;

if ($cat == "languages") {
	$val = $args[1];
	
	$list = array();
	$WHERE = $id ? "lan_id = '". $id ."'" : "lan_name LIKE '". $val ."%'";
	
	if ($val){
		$res = sql("SELECT lan_id, lan_name
			FROM languages
			WHERE ". $WHERE ." 
			ORDER BY lan_name ASC, LENGTH(lan_name) ASC
			LIMIT 5
		");
		while($row = sql_obj($res)) {
			$list[$row->lan_id] = $row->lan_name;
		}
	}
	if (!count($list)) $list = empty_suggest_list();

	echo json_encode(array("data" => suggest_list($list)));
	exit;
}

if ($cat == "words") {
	$val = $args[1];
	
	$list = array();	
	$WHERE = $id ? "wor_id = '". $id ."'" : "wor_value LIKE '". $val ."%'";
	
	if ($val){
		$res = sql("SELECT wor_id, wor_value
			FROM words
			WHERE ". $WHERE ." 
			ORDER BY wor_value ASC, LENGTH(wor_value) ASC
			LIMIT 5
		");
		while ($row = sql_obj($res)) {
			$list[$row->wor_id] = $row->wor_value;
		}		
	}
	if (!count($list)) $list = empty_suggest_list($val);

	echo json_encode(array("data" => suggest_list($list)));
	exit;
}

if ($cat == "word_types") {
	$val = $args[1];
	
	$list = array();
	$WHERE = $id ? "acc_id = '". $id ."'" : "acc_value LIKE '". $val ."%'";
	
	if ($val){
		$res = sql("SELECT acc_id, acc_nazev
			FROM account
			WHERE ". $WHERE ."
			ORDER BY acc_nazev ASC, LENGTH(acc_nazev) ASC
			LIMIT 5
		");
		while($row = sql_obj($res)) {
			$list[$row->acc_id] = $row->acc_nazev;
		}
	}
	if (!count($list)) $list = empty_suggest_list();

	echo json_encode(array("data" => suggest_list($list)));
	exit;
}

if ($cat == "categories") {
	$val = $args[1];
	
	$list = array();
	$WHERE = $id ? "cat_id = '". $id ."'" : "cat_name LIKE '". $val ."%'";
	
	if ($val){
		$res = sql("SELECT cat_id, cat_name
			FROM categories
			WHERE ". $WHERE ."
			ORDER BY cat_name ASC, LENGTH(cat_name) ASC
			LIMIT 5
		");
		while($row = sql_obj($res)) {
			$list[$row->cat_id] = $row->cat_name;
		}
	}
	if (!count($list)) $list = empty_suggest_list($val);

	echo json_encode(array("data" => suggest_list($list)));
	exit;
}

if ($cat == "translate") {
	$val = $args[1];
	$from = $args[2];
	$to = $args[3];
	
	$val = trim($val);
	
	$translation = false;
	
	#SEARCH WORDS DATABASE
	$res = sql("SELECT wor_id FROM words WHERE wor_value = '". sql_esc($val) ."' AND wor_lang = '". sql_esc($from) ."'");
	if ($row = sql_obj($res)) {
		$res = sql("SELECT wor_value 
			FROM word_links
			LEFT JOIN words ON wor_id = wol_word_a
			WHERE wol_word_b = '". $row->wor_id ."' AND wor_lang = '". sql_esc($to) ."'
		");
		if (!sql_count($res)) $res = sql("SELECT wor_value 
			FROM word_links
			LEFT JOIN words ON wor_id = wol_word_b
			WHERE wol_word_a = '". $row->wor_id ."' AND wor_lang = '". sql_esc($to) ."'
		");
		if ($row = sql_obj($res)) {
			$translation = $row->wor_value;
		}
	} 
	
	#USE EXTERNAL SOURCE, SAVE RESULTS
	if (!$translation) {
		$translation = ($from != $to) ? gpt_post_translate($val) : $val;
		if (stripos($val, " ") === false && $val != $translation) {
			sql("INSERT INTO words SET wor_lang = '". sql_esc($from) ."', wor_value = '". sql_esc($val) ."'");
			$wol_word_a = sql_lastid();
			
			sql("INSERT INTO words SET wor_lang = '". sql_esc($to) ."', wor_value = '". sql_esc($translation) ."'");
			$wol_word_b = sql_lastid();
			
			sql("INSERT INTO word_links SET wol_word_a = '". $wol_word_a ."', wol_word_b = '". $wol_word_b ."'");
		}
	}

	echo json_encode(array("data" => $translation));
	exit;
}

exit;
?>