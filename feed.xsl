<?xml version="1.0" encoding="UTF-8"?>
<!-- Makes feed.xml readable when someone opens it in a browser. Feed readers ignore this file. -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" encoding="UTF-8" indent="yes"/>
<xsl:template match="/">
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Release feed · Cold Ischemia Foundation</title>
<style>
@font-face{font-family:PF;src:url(fonts/playfairdisplay-900-normal.woff2) format("woff2");font-weight:900}
@font-face{font-family:CP;src:url(fonts/crimsonpro-400-normal.woff2) format("woff2")}
@font-face{font-family:Plex;src:url(fonts/ibmplexmono-500-normal.woff2) format("woff2")}
*{box-sizing:border-box}
body{margin:0;background:#070a10;color:#e9e3d6;font-family:CP,Georgia,serif;font-size:18px;line-height:1.55}
.w{max-width:820px;margin:0 auto;padding:36px 18px 70px}
.k{font-family:Plex,monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#C9A84C}
h1{font-family:PF,Georgia,serif;font-size:clamp(34px,7vw,56px);line-height:1;margin:10px 0 14px}
.box{border:1px solid #2a3346;background:#0d131d;padding:16px 18px;margin:18px 0 30px}
.box p{margin:0 0 10px}
code{display:block;font-family:Plex,monospace;font-size:14px;background:#05070c;border:1px solid #2a3346;padding:10px 12px;overflow-wrap:anywhere;color:#fff}
a{color:#C9A84C}
.it{border-top:1px solid #222b3b;padding:16px 0}
.it .c{font-family:Plex,monospace;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:#8f98a8}
.it h2{font-family:PF,Georgia,serif;font-size:22px;line-height:1.2;margin:6px 0}
.it h2 a{color:#f3eee3;text-decoration:none}
.it h2 a:hover{text-decoration:underline}
.it p{margin:0;color:#b9b2a4;font-size:16.5px}
</style>
</head>
<body><div class="w">
<div class="k">Cold Ischemia Foundation · Release feed</div>
<h1>Every release, the moment it opens.</h1>
<div class="box">
<p>This is the foundation's live feed. Paste the address below into any feed reader, news app or feed-to-email service, and every new release reaches you automatically.</p>
<code>https://coldischemia.foundation/feed.xml</code>
<p style="margin:12px 0 0">Prefer a calendar reminder or a full walkthrough? Visit <a href="this-week.html">This Week</a>.</p>
</div>
<xsl:for-each select="rss/channel/item">
<div class="it">
<div class="c"><xsl:value-of select="category"/> · <xsl:value-of select="substring(pubDate,1,16)"/></div>
<h2><a href="{link}"><xsl:value-of select="title"/></a></h2>
<p><xsl:value-of select="description"/></p>
</div>
</xsl:for-each>
</div></body>
</html>
</xsl:template>
</xsl:stylesheet>
