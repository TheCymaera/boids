<?php
$url = strtok("$_SERVER[REQUEST_SCHEME]://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]", "\?|#");

// page basic settings
$page_title 		= "Boids";
$page_description 	= "Flocking Simulation.";
$page_author		= "Morgan";
$page_keywords		= "Heledron, Cymaera";

// page open graph settings
$page_og_title 			= $page_title;
$page_og_description 	= $page_description;
$page_og_url 			= $url;
$page_og_image 			= $page_og_url . "thumbnail.png";
$page_og_type 			= "website";
?>
<!DOCTYPE html>
<html class="full-window-document">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

	<!-- title & favicon -->
	<title><?php echo $page_title;?></title>
    <link rel="icon" href="/favicon.png" type="image/png"/>
	
	<!-- info -->
    <meta name="author" content="<?php echo $page_author;?>"/>
    <meta name="description" content="<?php echo $page_description;?>"/>
    <meta name="keywords" content="<?php echo $page_keywords;?>"/>
	
	<!-- sharing -->
    <meta property="og:title" content="<?php echo $page_og_title;?>"/>
    <meta property="og:description" content="<?php echo $page_og_description;?>"/>
    <meta property="og:url"   content="<?php echo $page_og_url;?>"/>
    <meta property="og:image" content="<?php echo $page_og_image;?>"/>
    <meta property="og:type"  content="<?php echo $page_og_type;?>"/>

	<!-- styles -->
	<link rel="stylesheet" type="text/css" href="/shared/helion/v1/index.css"/>
	<link rel="stylesheet" type="text/css" href="/shared/fontawesome-free-5.13.1-web/css/all.min.css"/>

	<!-- scripts -->
	<script type="module" src="/shared/site/dst/widgets/canvas-app/index.js"></script>
	<script type="module" src="/shared/helion/v1/index.js"></script>
	<script type="module" src="./dst/main.js"></script>
</head>
<body class="stack">
	<site-canvas-app>
		<stack- slot=canvas style="
			background-color: var(--altSurface-background);
			color: var(--altSurface-foreground);
			
			user-select: none;
			-webkit-user-select: none;
		">
			<canvas></canvas>
			<div id="pressScreenMessage" style="
				padding: .5em; 
				display: flex; 
				align-items: end;
				font-size: 2vmin;
				
				pointer-events: none; 
				opacity: 1; 
				transition: opacity .3s ease; 
				will-change: opacity;
			">
				Press the screen to place an obstacle.
			</div>
		</stack->
		<div slot=info>
			<?php include "./info.html"; ?>
		</div>
	</site-canvas-app>
</body>
</html>
