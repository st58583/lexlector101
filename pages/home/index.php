<?php
if (login() && isset($_FILES['book_file'])) {
	$file = $_FILES['book_file'];
	if ($file['error'] !== UPLOAD_ERR_OK) set_error("Upload failed");
	
	if (!count($ERROR)) {
		$filename = $file['name'];
		$mimetype = mime_content_type($file['tmp_name']);
		$filesize = $file['size'];
		$filedata = file_get_contents($file['tmp_name']);
		
		$ext = array_last(explode('.', $filename));
		
		$real_filename = md5(microtime(1) . $filename) .'.'. $ext;
		
		$tmp_name = $_FILES["book_file"]["tmp_name"];
		move_uploaded_file($tmp_name, FILESYSTEM .'/files/'. $real_filename);
		
		$contents = parse_file(FILESYSTEM .'/files/'. $real_filename, $filename);
		
		if ($contents) {		
			sql("INSERT INTO users_books SET 
				ubo_user = '". login() ."', 
				ubo_custom_name = '". sql_esc($contents["name"] ?: $filename) ."', 
				ubo_file_name = '". sql_esc($real_filename) ."', 
				ubo_file_size = '". $filesize ."', 
				ubo_file_type = '". $ext ."', 
				ubo_author = '". sql_esc($contents['author']) ."',
				ubo_year = '". sql_esc(explode('-', $contents['year'])[0]) ."',
				ubo_text = '". sql_esc(implode("\n\n", $contents["chapters"])) ."',
				ubo_lang = '". $_SESSION['lang'] ."'
			");
			$last_id = sql_lastid();
			sql("UPDATE users_books SET ubo_order = '". $last_id ."' WHERE ubo_id = '". $last_id ."'");
			
			success(ui_lang('upload_success', 'Upload successful'));
			location('/lexlector/');
		} else set_error('error', 'File reading error');	
	}
}

if (post()) {
	p2d("book_id", 'int');
	p2d("title");
	p2d("author");
	p2d("year", 'int');
	p2d("lang");
	
	if (data('book_id')) {
		sql("UPDATE users_books SET 
			ubo_custom_name = '". sql_esc(data('title')) ."', 
			ubo_author = '". sql_esc(data('author')) ."', 
			ubo_year = '". date_in(data('year') .'-01-01') ."', 
			ubo_lang = '". data('lang') ."' 
			WHERE ubo_user = '". login() ."' AND ubo_id = '". data('book_id') ."'
		");
		
		success(ui_lang("book_updated", "Book updated"));
		location('/lexlector/');
	}
}

if (stripos($_SERVER['REQUEST_URI'], 'delete_book') !== false) {
	$res = sql("SELECT ubo_file_name FROM users_books WHERE ubo_user = '". login() ."' AND ubo_id = '". g_arg(0) ."'");
	if ($row = sql_obj($res)) {
		sql("DELETE FROM users_books WHERE ubo_user = '". login() ."' AND ubo_id = '". g_arg(0) ."'");
		@unlink(FILESYSTEM .'/files/'. $row->ubo_file_name);	
		
		success(ui_lang('book_deleted', 'Book deleted'));
		
		location('/lexlector/');	
	}
}

$TITLE = login() ? ui_lang('library', 'Library') : 'Homepage';

print '<div id="library">';
#NEW BOOK

print show_message();

print '<form action="./'. (login() ? '' : 'reader/') .'" method="post" enctype="multipart/form-data" class="mb20">
	<fieldset>
		<legend>📚 '. ui_lang('upload_book', 'Upload book') .'</legend>
		<div>
			<input type="file" name="book_file" accept=".txt,.epub,.docx" required>
			<button type="submit">'. ui_lang('upload', 'Upload') .'</button>
		</div>
		<p>'. ui_lang('supported_formats', 'Supported formats') .': .txt, .epub, .docx</p>
	</fieldset>
	</form>';
if (login()) {
	$res = sql("SELECT ubo_id, ubo_custom_name, ubo_author, ubo_year, ubo_lang FROM users_books WHERE ubo_user = '". login() ."'");
	if (sql_count($res)) {
		print '<table>
			<caption>'. ui_lang('library', 'Library') .'</caption>
			<thead>
			<tr>
			<th scope="col">'. ui_lang('name', 'Name') .'</th>
			<th scope="col">'. ui_lang('author', 'Author') .'</th>
			<th scope="col">'. ui_lang('year', 'Year') .'</th>
			<th scope="col">'. ui_lang('lang', 'Lang') .'</th>
			<th scope="col"></th>
			</tr>
		</thead>
		<tbody>';
		while ($row = sql_obj($res)){
			print '<tr>
				<td data-label="'. ui_lang('name', 'Name') .'"><a href="./reader/'. $row->ubo_id .'/">'. $row->ubo_custom_name .'</a></td>
				<td data-label="'. ui_lang('author', 'Author') .'">'. $row->ubo_author .'</td>
				<td data-label="'. ui_lang('year', 'Year') .'">'. year_out($row->ubo_year) .'</td>
				<td data-label="'. ui_lang('lang', 'Lang') .'">'. strtoupper($row->ubo_lang) .'</td>
				<td data-label="" class="t-right">
					<button class="edit-btn" data-id="'. $row->ubo_id .'" data-title="'. $row->ubo_custom_name .'" data-author="'. $row->ubo_author .'" data-year="'. year_out($row->ubo_year) .'" data-lang="'. $row->ubo_lang .'">🖊️</button>
					<button class="delete-btn" data-id="'. $row->ubo_id .'">🗑️</button>
				</td>
			</tr>';
		}
		print '</tbody>
</table>';
print '<div id="editPopup" class="popup hidden">
  <div class="popup-content">
    <h3>'. ui_lang('edit_book', 'Edit book') .'</h3>
	<form method="post" id="editForm">
	  <input type="hidden" name="book_id" id="editBookId">
	  <label>'. ui_lang('name', 'Name') .': <input type="text" name="title" id="editTitle"></label><br>
	  <label>'. ui_lang('author', 'Author') .': <input type="text" name="author" id="editAuthor"></label><br>
	  <label>'. ui_lang('year', 'Year') .': <input type="number" name="year" id="editYear"></label><br>
	  <label>'. ui_lang('lang', 'Lang') .': 
		<select name="lang" id="editLang" class="mb10">';
foreach($LANG_LIST as $lang) print '<option value="'. $lang .'">'. strtoupper($lang) .'</option>';
print '</select>
	  </label><br>
	  <button type="submit">'. ui_lang('save', 'Save') .'</button>
	  <button type="button" onclick="closePopup()">'. ui_lang('close', 'Close') .'</button>
	</form>
  </div>
</div>';
	} else print '<div class="blue_field">'. ui_lang('no_books', 'No books uploaded yet') .'</div>';

?>
<script>
/*document.querySelectorAll(".edit-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.getElementById("editBookId").value = btn.dataset.id;
    document.getElementById("editTitle").value = btn.dataset.title;
    document.getElementById("editAuthor").value = btn.dataset.author;
    document.getElementById("editYear").value = btn.dataset.year;
    document.getElementById("editLang").value = btn.dataset.lang;
    document.getElementById("editPopup").classList.remove("hidden");
  });
});*/

document.querySelectorAll(".edit-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.getElementById("editBookId").value = btn.dataset.id;
    document.getElementById("editTitle").value = btn.dataset.title;
    document.getElementById("editAuthor").value = btn.dataset.author;
    document.getElementById("editYear").value = btn.dataset.year;

    // Nastavení výběru jazyka
    const langSelect = document.getElementById("editLang");
    langSelect.value = ["cs", "en"].includes(btn.dataset.lang.toLowerCase())
      ? btn.dataset.lang.toLowerCase()
      : "cs"; // fallback na cs, pokud je hodnota neplatná

    document.getElementById("editPopup").classList.remove("hidden");
  });
});

function closePopup() {
  document.getElementById("editPopup").classList.add("hidden");
}

document.querySelectorAll(".delete-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    if (confirm("<?php echo ui_lang("confirm_delete", "Do you really want to delete this book") ."?"; ?> ")) {
		window.location.replace("/lexlector/delete_book/"+ btn.dataset.id);
    }
  });
});
</script>
<?php

}
print '</div>';
?>