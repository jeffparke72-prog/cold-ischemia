import re,sys
NOTE='''<div class="api-row" style="border:1px solid rgba(80,200,120,.35);background:rgba(80,200,120,.07);padding:12px 16px;border-radius:6px;margin:14px 0;font-size:.82rem;line-height:1.6;letter-spacing:.02em"><b style="color:#50c878">No key. No account. Nothing leaves your device.</b> This instrument runs entirely in your browser. It is a built-in writer, not a chat model: every sentence was written by a person, and your own scores and words decide which ones you get.</div>'''
def patch_ui(s):
    s=re.sub(r'<div class="api-row">.*?</div>\s*(?=\n)',NOTE,s,count=1,flags=re.S)
    s=re.sub(r'<label for="apiKey">API Key</label>\s*<input[^>]*id="apiKey"[^>]*>',NOTE,s,count=1)
    if 'cif-local-ai.js' not in s: s=s.replace('<script>','<script src="cif-local-ai.js"></script>\n<script>',1)
    return s
if __name__=='__main__':
    f=sys.argv[1]; s=open(f,encoding='utf-8').read(); s=patch_ui(s); open(f,'w',encoding='utf-8').write(s)
