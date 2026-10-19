import json
plan=json.load(open('/tmp/pt/fplan.json'))
P={s['id']:s for s in plan['p']}
j=json.load(open('script.json'))
r=P['reveal']
j['open'].update({'from':round(r['t0']+.2,2),'until':round(r['t1']+.4,2)})
j['music']['groove']=[[0,round(r['t1']+.4,2),104,1.0],[round(P['ask']['t0']-.2,2),round(plan['d']-3,2),104,1.0]]
j['music'].pop('liftAt',None)
j['bug']['in']=round(r['t1']-.4,2)
json.dump(j,open('script.json','w'),indent=1)
print(j['open'],j['music']['groove'],j['bug']['in'])
