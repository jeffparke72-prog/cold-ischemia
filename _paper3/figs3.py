import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
TEAL='#0e8fb0'; AMBER='#c96a14'; INK='#1c2b3a'; MUTE='#5f6b78'
plt.rcParams.update({'text.parse_math':False,'font.family':'DejaVu Sans','font.size':11,'axes.edgecolor':'#9aa5b1','axes.labelcolor':INK,'text.color':INK,'xtick.color':MUTE,'ytick.color':MUTE})
OUT='/home/user/cold-ischemia/_paper3/fig/'
def save(fig,n): fig.savefig(OUT+n+'.png',dpi=220,bbox_inches='tight',facecolor='white'); plt.close(fig)
def clean(ax,left=True):
    for s in ('top','right'): ax.spines[s].set_visible(False)
    if not left: ax.spines['left'].set_visible(False)
# promise: expected vs 2012 beneficiaries
fig,ax=plt.subplots(figsize=(7.4,2.9))
ax.barh([1],[10000],color=AMBER,height=.5); ax.barh([0],[525481],color=TEAL,height=.5)
ax.text(10000+8000,1,'about 10,000 expected',va='center',fontweight='bold'); ax.text(525481-8000,0,'525,481 Medicare beneficiaries',va='center',ha='right',color='white',fontweight='bold')
ax.set_yticks([0,1],['2012','1972 projection']); ax.set_xlim(0,560000); ax.set_xticks([]); clean(ax,False); ax.tick_params(left=False)
ax.set_title('People with kidney failure covered by the promise',loc='left',fontweight='bold',fontsize=12)
fig.text(0.02,-0.03,'1972 figure: commonly cited contemporary projection. 2012 figure: USRDS, as reported in later accounts.',fontsize=8,color=MUTE); save(fig,'promise')
# pregnancy
fig,(a,b)=plt.subplots(1,2,figsize=(7.4,3.1),gridspec_kw={'width_ratios':[1,1]})
for ax,labs,vals,cols,t in ((a,['Toronto intensive\n(22 pregnancies)','US registry\n(70 pregnancies)'],[86.4,61.4],[TEAL,'#9aa5b1'],'By program'),(b,['20 h/week\nor fewer','More than\n36 h/week'],[48,85],['#9aa5b1',TEAL],'By weekly hours')):
    r=ax.bar(labs,vals,color=cols,width=.55)
    for x,v in zip(r,vals): ax.text(x.get_x()+x.get_width()/2,v+2,f'{v:g}%',ha='center',fontweight='bold')
    ax.set_ylim(0,105); ax.set_yticks([]); clean(ax,False); ax.tick_params(left=False,labelsize=8.5); ax.set_title(t,loc='left',fontsize=10.5,fontweight='bold')
fig.suptitle('Live births in pregnancies on dialysis',x=0.02,ha='left',fontweight='bold',fontsize=12,y=1.03); save(fig,'preg')
# crowd
fig,ax=plt.subplots(figsize=(7.4,2.6))
ax.barh([1],[11.5],color=AMBER,height=.5); ax.barh([0],[48],color=TEAL,height=.5)
ax.text(11.5+1.5,1,'11.5%',va='center',fontweight='bold'); ax.text(48+1.5,0,'nearly half (about 48%)',va='center',fontweight='bold')
ax.set_yticks([0,1],['Liver campaigns','Kidney campaigns\n(258)']); ax.set_xlim(0,80); ax.set_xticks([]); clean(ax,False); ax.tick_params(left=False)
ax.set_title('Share of the requested amount raised',loc='left',fontweight='bold',fontsize=12)
fig.text(0.02,-0.04,'Canadian transplant crowdfunding campaigns, PLoS ONE 2019. Liver shown as 48% for display; the paper reports nearly half.',fontsize=8,color=MUTE); save(fig,'crowd')
