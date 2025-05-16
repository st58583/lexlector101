<!DOCTYPE html>
<html lang="cs">
<head>
	<title>{%TITLE%}</title>
	<base href="http://{%SERVER%}/" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta charset="UTF-8">
	<link rel="stylesheet" id="theme_stylesheet" href="css/style.css?2025v13" />
	<!--<link rel="stylesheet" media="print" href="./css/print.css" />-->
	<script type="text/javascript" src="js/js.js?2025v4"></script>
</head>
<body>
	<header>
		<div>
			<div class="logo"><a href="./"><img src="./img/logo.png" alt="LexLector" title="LexLector" /></a></div>
			<nav>
				<div>
					<div class="logo"><img src="./img/logo.png" alt="LOGO" title="LOGO" /></div>
					<button type="button" id="close_menu_btn"></button>
				</div>
				{%MENU%}
			</nav>
			<div class="header_right">
				<!--<button type="button" class="search_btn"></button>-->
				<button id="theme_toggle" title="Přepnout režim" style="font-size: 16pt; background: none; border: none; color: #fff; cursor: pointer;">🌙</button>

				<!-- Select language -->
				{%LANG%}
				
				<button type="button" id="open_menu_btn">
					<span></span>
					<span></span>
					<span></span>
				</button>
			</div>
		</div>
	</header>
	<main>
		<section>
		{%CONTENT%}
		</section>
	</main>
	<footer><span>&copy;2025 LexLector</span></footer>
</body>
</html>