<?php
$TITLE = 'Chyba';
$kod = g_arg(0);
if ($kod) $TITLE .= ' '. $kod;

print columns_start();
print column_start();
print '<h2>'. $TITLE .'</h2>';
print column_end();
print columns_end();
?>