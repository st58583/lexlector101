<?php
$TITLE = 'Reader';

$author = $text = $name = '';
$lang = 'en';

if (isset($_FILES['book_file'])) {
	$file = $_FILES['book_file'];
	if ($file['error'] !== UPLOAD_ERR_OK) set_error("Upload failed");
	
	if (!count($ERROR)) {
		$filename = $file['name'];		
		$ext = array_last(explode('.', $filename));
		$real_filename = md5(microtime(1) . $filename) .'.'. $ext;
		
		$tmp_name = $_FILES["book_file"]["tmp_name"];
		move_uploaded_file($tmp_name, FILESYSTEM .'/files/'. $real_filename);
		
		$contents = parse_file(FILESYSTEM .'/files/'. $real_filename, $filename);
		unlink(FILESYSTEM .'/files/'. $real_filename);
		
		$name = $filename;
		$author = $contents['author'];
		$text = implode("\n\n", $contents["chapters"]);
	} else location('/lexlector/');
	
} elseif (login() && g_arg(0)){
	$id = (int) g_arg(0);
	
	$res = sql("SELECT ubo_author, ubo_custom_name, ubo_text, ubo_lang FROM users_books WHERE ubo_user = '". login() ."' AND ubo_id = '". $id ."'");
	if ($row = sql_obj($res)) {
		$name = $row->ubo_custom_name;
		$author = $row->ubo_author;
		$text = $row->ubo_text;
		$lang = $row->ubo_lang;
		
		sql("UPDATE users_books SET ubo_read_dt = NOW() WHERE ubo_id = '". $id ."'");
	} else location('/lexlector/');
} else location('/lexlector/');

#EDIT
$_text = str_replace("\n", '<br />', $text);

print '<div class="reader_wrapper" id="reader_wrapper">
    <div class="reader_header">
      <div class="reader_info">
		<a href="/lexlector/" class="color_white no_decoration">««</a> 
		<select id="document_lang">';
foreach($LANG_LIST as $_lang) print '<option value="'. $_lang .'"'. ($lang == $_lang ? ' selected' : '') .'>'. strtoupper($_lang) .'</option>';
print '</select> 
		<strong>'. ui_lang('name', 'Name') .':</strong> '. $name . ($author ? '&nbsp;&nbsp;|&nbsp;&nbsp;<strong>'. ui_lang('author', 'Author') .':</strong> '. $author : '') .'</div>
    </div>
    <div class="reader_body">';
print $_text;
print '</div>
</div>';

print '<div id="translate_popup"></div>';
#print '<div class="popup_content"><span class="popup_translation">slovo</span><span class="popup_icon" title="Přeložit celou větu" style="float: right; cursor: pointer;">📖</span></div>';
?>
<script>
const lang_to = '<?php echo $_SESSION['lang']; ?>';
const translating = '<?php echo ui_lang('translating', 'Translating…') ?>';
const whole_sentence = '<?php echo ui_lang('whole_sentence', 'Whole sentence') ?>';

document.addEventListener("DOMContentLoaded", () => {
  const reader = document.querySelector(".reader_body");
  const popup = document.getElementById("translate_popup");

  reader.addEventListener("click", (e) => {
    const x = e.pageX;
    const y = e.pageY;

    const selection = window.getSelection();
    selection.removeAllRanges();

    const range = document.caretRangeFromPoint
      ? document.caretRangeFromPoint(e.clientX, e.clientY)
      : document.caretPositionFromPoint
      ? (() => {
          const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
          const r = document.createRange();
          r.setStart(pos.offsetNode, pos.offset);
          return r;
        })()
      : null;

    if (!range || !range.startContainer || range.startContainer.nodeType !== 3) return;

    const text = range.startContainer.textContent;
    const offset = range.startOffset;

    const left = text.slice(0, offset).search(/\S+$/);
    const right = text.slice(offset).search(/\s/);
    const word = text.slice(
      left === -1 ? 0 : left,
      right === -1 ? text.length : offset + right
    ).trim();

    if (!word) return;

    // Najdi celou větu
    const fullText = text;
    const before = fullText.slice(0, offset);
    const after = fullText.slice(offset);

    const start = before.lastIndexOf('.') + 1;
    const endP = after.indexOf('.');
    const end = endP !== -1 ? offset + endP + 1 : fullText.length;

    const sentence = fullText.slice(start, end).trim();

    popup.style.left = x + "px";
    popup.style.top = y + "px";
    popup.innerHTML = '<span class="popup_translation">'+ translating +'</span><span class="popup_icon" title="'+ whole_sentence +'" style="float: right; cursor: pointer;">📖</span>';
    popup.style.display = "block";
	
	const lang_from = id("document_lang").value;

    ajicek2({
      'ajicek': 'translate/' + encodeURIComponent(word) + '/'+ lang_from +'/' + lang_to,
      'success': function (data) {
        popup.querySelector(".popup_translation").textContent = data.data;
      }
    });

    // Klik na 📖 přeloží celou větu
    popup.querySelector(".popup_icon").addEventListener("click", (ev) => {
      ev.stopPropagation(); // aby se popup nezavřel
      popup.querySelector(".popup_translation").textContent = translating;

      ajicek2({
        'ajicek': 'translate/' + encodeURIComponent(sentence) + '/'+ lang_from +'/' + lang_to,
        'success': function (data) {
          popup.querySelector(".popup_translation").textContent = data.data;
        }
      });
    });
  });

  // Klik mimo => zavřít
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".reader_body") && e.target !== popup) {
      popup.style.display = "none";
    }
  });

  // Klik na popup => zavřít
  popup.addEventListener("click", () => {
    popup.style.display = "none";
  });
});


/*document.addEventListener("DOMContentLoaded", () => {
  const reader = document.querySelector(".reader_body");
  const popup = document.getElementById("translate_popup");

  reader.addEventListener("click", (e) => {
    const x = e.pageX;
    const y = e.pageY;

    const selection = window.getSelection();
    selection.removeAllRanges();

    const range = document.caretRangeFromPoint
      ? document.caretRangeFromPoint(e.clientX, e.clientY)
      : document.caretPositionFromPoint
      ? (() => {
          const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
          const r = document.createRange();
          r.setStart(pos.offsetNode, pos.offset);
          return r;
        })()
      : null;

    if (!range || !range.startContainer || range.startContainer.nodeType !== 3) return;

    const text = range.startContainer.textContent;
    const offset = range.startOffset;

    const left = text.slice(0, offset).search(/\S+$/);
    const right = text.slice(offset).search(/\s/);
    const word = text.slice(
      left === -1 ? 0 : left,
      right === -1 ? text.length : offset + right
    ).trim();

    if (!word) return;

    popup.style.left = x + "px";
    popup.style.top = y + "px";
    popup.textContent = '';
    popup.style.display = "block";
	
	ajicek2({
		'ajicek': 'translate/'+ word +'/en/'+ lang_to,
		'success': function(data){
			popup.textContent = data.data;
		}
	});
  });

  // Klik mimo => zavřít
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".reader_body") && e.target !== popup) {
      popup.style.display = "none";
    }
  });

  // Klik na popup => zavřít
  popup.addEventListener("click", () => {
    popup.style.display = "none";
  });
});*/
</script>