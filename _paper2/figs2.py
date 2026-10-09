import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt, numpy as np, textwrap
from matplotlib.patches import FancyBboxPatch, Circle, FancyArrowPatch
TEAL='#0e8fb0'; AMBER='#c96a14'; INK='#1c2b3a'; MUTE='#5f6b78'; GRID='#e3e8ee'; SAND='#f6efe3'
plt.rcParams.update({'text.parse_math':False,'font.family':'DejaVu Sans','font.size':11,'axes.edgecolor':'#9aa5b1','axes.labelcolor':INK,'text.color':INK,'xtick.color':MUTE,'ytick.color':MUTE})
OUT='/home/user/cold-ischemia/_paper2/fig/'
def save(fig,n): fig.savefig(OUT+n+'.png',dpi=220,bbox_inches='tight',facecolor='white'); plt.close(fig)
def clean(ax,left=True):
    for s in ('top','right'): ax.spines[s].set_visible(False)
    if not left: ax.spines['left'].set_visible(False)
def wrap(s,w): return '\n'.join(textwrap.wrap(s,w))

# time
fig,ax=plt.subplots(figsize=(7.4,2.9))
ax.barh([1],[2080],color='#c9d1da',height=.5,edgecolor='white',linewidth=2)
ax.barh([0],[624],color=TEAL,height=.5,edgecolor='white',linewidth=2); ax.barh([0],[468],left=624,color=AMBER,height=.5,edgecolor='white',linewidth=2)
ax.text(1040,1,'2,080 hours',ha='center',va='center',fontweight='bold'); ax.text(312,0,'624 in the chair',ha='center',va='center',color='white',fontweight='bold',fontsize=9.5); ax.text(858,0,'468 recovering',ha='center',va='center',color='white',fontweight='bold',fontsize=9.5)
ax.text(1100,0,'1,092 hours: about half a full-time job',va='center',color=INK,fontsize=10.5)
ax.set_yticks([0,1],['A year of in-center\nhemodialysis','A full-time work year\n(40 h x 52 weeks)']); ax.set_xlim(0,2300); ax.set_xticks([]); clean(ax,False); ax.tick_params(left=False)
ax.set_title('Hours in a year',loc='left',fontweight='bold',fontsize=12); save(fig,'time')

# song
fig,ax=plt.subplots(figsize=(7.4,3.1)); labs=['Ability to travel','Time free from dialysis','Adequacy of dialysis','Feeling washed out after dialysis']; vals=[0.9,0.5,0.3,0.2]
b=ax.barh(labs[::-1],vals[::-1],color=TEAL,height=.5)
for r,v in zip(b,vals[::-1]): ax.text(v+0.02,r.get_y()+r.get_height()/2,f'+{v}',va='center',fontweight='bold')
ax.set_xlim(0,1.15); ax.set_xticks([]); clean(ax,False); ax.tick_params(left=False)
ax.set_title('Rated higher by patients and caregivers than by clinicians',loc='left',fontweight='bold',fontsize=11.5)
ax.text(0,-0.95,'Mean difference on the survey rating scale. SONG-HD international Delphi survey, 2017.',fontsize=8,color=MUTE,transform=ax.transData); save(fig,'song')

# aware
fig,ax=plt.subplots(figsize=(7.4,3.3)); labs=['Early-stage CKD, older CDC analysis','Severely reduced function, not on dialysis,\nolder CDC analysis','Stages 3 and 4, recent study','All CKD, American Kidney Fund estimate']; vals=[96,48,50,90]
b=ax.barh(labs[::-1],vals[::-1],color=TEAL,height=.5)
for r,v,l in zip(b,vals[::-1],['~90%','~50%','48%','96%']): ax.text(r.get_width()+1.5,r.get_y()+r.get_height()/2,l,va='center',fontweight='bold')
ax.set_xlim(0,115); ax.set_xticks([]); clean(ax,False); ax.tick_params(left=False,labelsize=9)
ax.set_title('Share of adults with kidney disease who are unaware of it',loc='left',fontweight='bold',fontsize=11.5)
fig.text(0.02,-0.04,'Different studies and years; not directly comparable.',fontsize=8,color=MUTE); save(fig,'aware')

# fill
fig,ax=plt.subplots(figsize=(7.4,3.2)); yrs=['2010','2024','2025']; v=[94.1,65.8,73.0]
b=ax.bar(yrs,v,color=[TEAL,TEAL,TEAL],width=.45)
for r,val,l in zip(b,v,['94.1%','65.8%','about 73%']): ax.text(r.get_x()+r.get_width()/2,val+1.5,l,ha='center',fontweight='bold')
ax.set_ylim(0,110); ax.set_yticks([]); clean(ax,False); ax.tick_params(left=False)
ax.set_title('Adult nephrology fellowship positions that were filled',loc='left',fontweight='bold',fontsize=11.5); save(fig,'fill')

# chain schematic
fig,ax=plt.subplots(figsize=(8,3.4)); ax.set_xlim(0,10); ax.set_ylim(0,4); ax.axis('off')
xs=[1,3,5,7,9]; names=['Non-directed\ndonor','Pair 1\nrecipient','Pair 2\nrecipient','Pair 3\nrecipient','Waiting-list\nrecipient']
roles=['gives first','whose partner\ngives next','whose partner\ngives next','whose partner\ngives last','receives the final\nkidney']
for i,(x,n,r) in enumerate(zip(xs,names,roles)):
    col=AMBER if i==0 else TEAL
    ax.add_patch(Circle((x,2.3),0.55,color=col)); ax.text(x,2.3,str(i),ha='center',va='center',color='white',fontweight='bold',fontsize=13)
    ax.text(x,1.15,n,ha='center',va='center',fontweight='bold',fontsize=9.5); ax.text(x,0.35,r,ha='center',va='center',fontsize=8.3,color=MUTE)
    if i<4: ax.add_patch(FancyArrowPatch((x+0.62,2.3),(xs[i+1]-0.62,2.3),arrowstyle='-|>',mutation_scale=16,color=INK,lw=1.4))
ax.text(5,3.55,'One gift unlocks the next, and nobody repays the person who gave to them',ha='center',fontsize=10.5,fontweight='bold'); save(fig,'chain')

# hazard
fig,ax=plt.subplots(figsize=(7.4,3.8)); h=np.linspace(6,36,100)
g=1.013**(h-6); d=1.018**(h-6)
ax.plot(h,g,color=TEAL,lw=2.4); ax.plot(h,d,color=AMBER,lw=2.4)
ax.text(36.4,g[-1],'Graft failure',color=TEAL,va='center',fontweight='bold'); ax.text(36.4,d[-1],'Death',color=AMBER,va='center',fontweight='bold')
ax.set_xlim(6,42); ax.set_xlabel('Hours in cold storage'); ax.set_ylabel('Relative hazard (6 hours = 1.0)'); clean(ax)
ax.set_title('What each added hour compounds to',loc='left',fontweight='bold',fontsize=11.5)
fig.text(0.12,-0.09,'Extrapolated from published per-hour hazard ratios (1.013 and 1.018); author calculation, illustrative.',fontsize=8,color=MUTE); save(fig,'hazard')

# graft
fig,ax=plt.subplots(figsize=(7.4,3.6)); cats=['Deceased donor','Living donor']; early=[8.2,12.1]; late=[11.7,19.2]; x=np.arange(2); w=.32
b1=ax.bar(x-w/2-0.01,early,w,color=TEAL); b2=ax.bar(x+w/2+0.01,late,w,color=AMBER)
for r,v in list(zip(b1,early))+list(zip(b2,late)): ax.text(r.get_x()+r.get_width()/2,v+0.4,f'{v}',ha='center',fontweight='bold')
ax.set_xticks(x,cats); ax.set_ylim(0,23); ax.set_yticks([]); clean(ax,False); ax.tick_params(bottom=False)
ax.text(-0.45,21.5,'Transplants in 1995 to 1999',color=TEAL,fontweight='bold',fontsize=10); ax.text(-0.45,19.7,'Recent era (estimates)',color=AMBER,fontweight='bold',fontsize=10)
ax.set_title('Median years a kidney graft lasts',loc='left',fontweight='bold',fontsize=11.5); save(fig,'graft')

# counted vs named
fig,ax=plt.subplots(figsize=(8.2,3.9)); ax.set_xlim(0,10); ax.set_ylim(0,5); ax.axis('off')
def col(x,title,items,color):
    ax.text(x,4.7,title,fontweight='bold',fontsize=10.5,va='top')
    for i,t in enumerate(items):
        y=3.5-i*0.72
        ax.add_patch(FancyBboxPatch((x,y-0.28),4.4,0.56,boxstyle='round,pad=0.02,rounding_size=0.08',fc='white',ec=color,lw=1.6)); ax.text(x+0.15,y,t,va='center',fontsize=9)
col(0.1,'What the main federal measures count',['Transplants performed (60 of 100 points)','Organ offers accepted (20 points)','Graft survival (20 points)','Donation and transplant rates of OPOs','Home dialysis and waitlisting rates'],TEAL)
col(5.4,'What patients and caregivers rated higher',['Ability to travel','Time free from dialysis','Adequacy of dialysis','Feeling washed out afterward'],AMBER)
save(fig,'counted')

# nonuse
fig,ax=plt.subplots(figsize=(7.4,3.7)); yr=[2013,2022,2023,2024]; v=[18.2,26.6,27.9,29.3]
ax.plot(yr[:2],v[:2],':',color=TEAL,lw=1.8); ax.plot(yr[1:],v[1:],'-',color=TEAL,lw=2.4); ax.scatter(yr,v,s=60,color=TEAL,zorder=3,edgecolor='white',linewidth=1.5)
for a,b in zip(yr,v): ax.text(a,b+1.2,f'{b}%',ha='center',fontweight='bold')
ax.set_ylim(10,35); ax.set_xlim(2012,2025); ax.set_ylabel('Recovered kidneys not transplanted (%)'); clean(ax)
ax.set_title('Nonuse of recovered kidneys, selected years',loc='left',fontweight='bold',fontsize=11.5)
fig.text(0.12,-0.03,'Dotted line: years not plotted. Report editions define counts slightly differently.',fontsize=8,color=MUTE); save(fig,'nonuse')
print('ok')
