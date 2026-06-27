(function () {
    'use strict';

    /* ══════════════════════════════════════════════════════════
       TILE DEFINITIONS
    ══════════════════════════════════════════════════════════ */
    const IMG = '/img/tile-png-white-bg/';

    const TILES = {
        m1:{suit:'m',num:1,img:'man-1.png',label:'1м',terminal:true,honor:false},
        m2:{suit:'m',num:2,img:'man-2.png',label:'2м',terminal:false,honor:false},
        m3:{suit:'m',num:3,img:'man-3.png',label:'3м',terminal:false,honor:false},
        m4:{suit:'m',num:4,img:'man-4.png',label:'4м',terminal:false,honor:false},
        m5:{suit:'m',num:5,img:'man-5.png',label:'5м',terminal:false,honor:false},
        m6:{suit:'m',num:6,img:'man-6.png',label:'6м',terminal:false,honor:false},
        m7:{suit:'m',num:7,img:'man-7.png',label:'7м',terminal:false,honor:false},
        m8:{suit:'m',num:8,img:'man-8.png',label:'8м',terminal:false,honor:false},
        m9:{suit:'m',num:9,img:'man-9.png',label:'9м',terminal:true,honor:false},
        m0:{suit:'m',num:5,img:'man-red-dora.png',label:'5м★',terminal:false,honor:false,isRed:true},
        p1:{suit:'p',num:1,img:'pin-1.png',label:'1п',terminal:true,honor:false},
        p2:{suit:'p',num:2,img:'pin-2.png',label:'2п',terminal:false,honor:false},
        p3:{suit:'p',num:3,img:'pin-3.png',label:'3п',terminal:false,honor:false},
        p4:{suit:'p',num:4,img:'pin-4.png',label:'4п',terminal:false,honor:false},
        p5:{suit:'p',num:5,img:'pin-5.png',label:'5п',terminal:false,honor:false},
        p6:{suit:'p',num:6,img:'pin-6.png',label:'6п',terminal:false,honor:false},
        p7:{suit:'p',num:7,img:'pin-7.png',label:'7п',terminal:false,honor:false},
        p8:{suit:'p',num:8,img:'pin-8.png',label:'8п',terminal:false,honor:false},
        p9:{suit:'p',num:9,img:'pin-9.png',label:'9п',terminal:true,honor:false},
        p0:{suit:'p',num:5,img:'pin-red-dora.png',label:'5п★',terminal:false,honor:false,isRed:true},
        s1:{suit:'s',num:1,img:'sou-1.png',label:'1с',terminal:true,honor:false},
        s2:{suit:'s',num:2,img:'sou-2.png',label:'2с',terminal:false,honor:false},
        s3:{suit:'s',num:3,img:'sou-3.png',label:'3с',terminal:false,honor:false},
        s4:{suit:'s',num:4,img:'sou-4.png',label:'4с',terminal:false,honor:false},
        s5:{suit:'s',num:5,img:'sou-5.png',label:'5с',terminal:false,honor:false},
        s6:{suit:'s',num:6,img:'sou-6.png',label:'6с',terminal:false,honor:false},
        s7:{suit:'s',num:7,img:'sou-7.png',label:'7с',terminal:false,honor:false},
        s8:{suit:'s',num:8,img:'sou-8.png',label:'8с',terminal:false,honor:false},
        s9:{suit:'s',num:9,img:'sou-9.png',label:'9с',terminal:true,honor:false},
        s0:{suit:'s',num:5,img:'sou-red-dora.png',label:'5с★',terminal:false,honor:false,isRed:true},
        we:{suit:'w',num:1,img:'wind-east.png',label:'東',terminal:false,honor:true},
        ws:{suit:'w',num:2,img:'wind-south.png',label:'南',terminal:false,honor:true},
        ww:{suit:'w',num:3,img:'wind-west.png',label:'西',terminal:false,honor:true},
        wn:{suit:'w',num:4,img:'wind-north.png',label:'北',terminal:false,honor:true},
        dw:{suit:'d',num:1,img:'dragon-white.png',label:'白',terminal:false,honor:true},
        dg:{suit:'d',num:2,img:'dragon-green.png',label:'發',terminal:false,honor:true},
        dr:{suit:'d',num:3,img:'dragon-red.png',label:'中',terminal:false,honor:true},
    };

    const PALETTE_ORDER = [
        ['man',  ['m1','m2','m3','m4','m5','m0','m6','m7','m8','m9']],
        ['pin',  ['p1','p2','p3','p4','p5','p0','p6','p7','p8','p9']],
        ['sou',  ['s1','s2','s3','s4','s5','s0','s6','s7','s8','s9']],
        ['wind', ['we','ws','ww','wn']],
        ['dragon',['dw','dg','dr']],
    ];

    // Demonstration hand shown on first visit (tanyao, 4 chi + tanki)
    const DEFAULT_HAND = ['m3','m4','m5','m5','m6','m7','p2','p3','p4','s3','s4','s5','s2','s2'];

    const SORT_IDX = {};
    ['m1','m2','m3','m4','m5','m0','m6','m7','m8','m9',
     'p1','p2','p3','p4','p5','p0','p6','p7','p8','p9',
     's1','s2','s3','s4','s5','s0','s6','s7','s8','s9',
     'we','ws','ww','wn','dw','dg','dr'].forEach((t,i) => SORT_IDX[t]=i);

    /* ══════════════════════════════════════════════════════════
       STATE
    ══════════════════════════════════════════════════════════ */
    let state = {
        hand:[], roundWind:'e', seatWind:'e',
        isTsumo:false, isRiichi:false, isDblRiichi:false,
        isIppatsu:false, isOpen:false,
        honbo:0, dora:0, uraDora:0,
    };

    /* ══════════════════════════════════════════════════════════
       TILE UTILITIES
    ══════════════════════════════════════════════════════════ */
    function norm(id){ return id==='m0'?'m5':id==='p0'?'p5':id==='s0'?'s5':id; }
    function isHonor(id){ return 'wd'.includes(id[0]); }
    function isTermHon(id){ const t=TILES[norm(id)]; return t&&(t.terminal||t.honor); }

    function countMap(hand){
        const m=new Map();
        hand.forEach(id=>{ const n=norm(id); m.set(n,(m.get(n)||0)+1); });
        return m;
    }

    function copiesLeft(id){
        const n=norm(id);
        let used=0;
        state.hand.forEach(t=>{ if(norm(t)===n) used++; });
        return 4-used;
    }

    /* Найти индекс первой смежной пары в отсортированном массиве */
    function firstPairIdx(sorted){
        for(let i=0;i<sorted.length-1;i++){
            if(norm(sorted[i])===norm(sorted[i+1])) return i;
        }
        return -1;
    }

    function sortHand(h){
        /* Базовая сортировка по мастям/номерам */
        const sorted=[...h].sort((a,b)=>(SORT_IDX[a]||99)-(SORT_IDX[b]||99));

        /* ── 14 тайлов: используем декомпозицию, чтобы точно знать пару ── */
        if(h.length===14){
            const decomps=allDecomps(h);
            if(decomps&&decomps.length){
                const pairTile=decomps[0].pair; // нормализованный id пары
                const work=[...sorted];
                /* Извлечь ровно 2 тайла пары (с конца, чтобы не сломать порядок) */
                const pairTiles=[];
                for(let i=work.length-1;i>=0&&pairTiles.length<2;i--){
                    if(norm(work[i])===pairTile){ pairTiles.unshift(work.splice(i,1)[0]); }
                }
                if(pairTiles.length===2) return [...work,...pairTiles];
            }
        }

        /* ── Запасной вариант: первая смежная пара → в конец ── */
        const pi=firstPairIdx(sorted);
        if(pi>=0){
            const pair=sorted.splice(pi,2);
            return [...sorted,...pair];
        }
        return sorted;
    }

    /* ══════════════════════════════════════════════════════════
       HAND DECOMPOSITION
    ══════════════════════════════════════════════════════════ */
    function allDecomps(hand14){
        const cm = countMap(hand14);
        const keys = [...cm.keys()].filter(k=>cm.get(k)>0).sort((a,b)=>SORT_IDX[a]-SORT_IDX[b]);
        const results=[]; const tried=new Set();
        for(const k of keys){
            if(tried.has(k)) continue;
            if((cm.get(k)||0)>=2){
                tried.add(k);
                const nc=new Map(cm); nc.set(k,nc.get(k)-2);
                const melds=findMelds(nc);
                if(melds) melds.forEach(ms=>results.push({pair:k,melds:ms}));
            }
        }
        return results;
    }

    function findMelds(cm){
        const keys=[...cm.keys()].filter(k=>cm.get(k)>0).sort((a,b)=>SORT_IDX[a]-SORT_IDX[b]);
        if(!keys.length) return [[]];
        const first=keys[0]; const results=[];
        // pon
        if((cm.get(first)||0)>=3){
            const nc=new Map(cm); nc.set(first,nc.get(first)-3);
            const sub=findMelds(nc);
            if(sub) sub.forEach(s=>results.push([{type:'pon',tile:first},...s]));
        }
        // chi
        if('mps'.includes(first[0])){
            const suit=first[0], num=parseInt(first[1]);
            if(num<=7){
                const t2=suit+(num+1), t3=suit+(num+2);
                if((cm.get(t2)||0)>0&&(cm.get(t3)||0)>0){
                    const nc=new Map(cm);
                    nc.set(first,nc.get(first)-1);
                    nc.set(t2,nc.get(t2)-1);
                    nc.set(t3,nc.get(t3)-1);
                    const sub=findMelds(nc);
                    if(sub) sub.forEach(s=>results.push([{type:'chi',tiles:[first,t2,t3]},...s]));
                }
            }
        }
        return results.length?results:null;
    }

    function isChiitoitsu(hand14){
        if(hand14.length!==14) return false;
        const cm=countMap(hand14);
        return cm.size===7&&[...cm.values()].every(v=>v===2);
    }

    function isKokushi(hand14){
        if(hand14.length!==14) return false;
        const terms=['m1','m9','p1','p9','s1','s9','we','ws','ww','wn','dw','dg','dr'];
        const nh=hand14.map(norm);
        if(!nh.every(t=>terms.includes(t))) return false;
        return terms.every(t=>nh.includes(t));
    }

    /* ══════════════════════════════════════════════════════════
       WAIT TYPE
    ══════════════════════════════════════════════════════════ */
    function waitType(decomp, winTile){
        const wn=norm(winTile);
        if(decomp.pair===wn) return 'tanki';
        for(const m of decomp.melds){
            if(m.type==='pon'&&m.tile===wn) return 'shanpon';
            if(m.type==='chi'&&m.tiles.includes(wn)){
                const idx=m.tiles.indexOf(wn);
                const nums=m.tiles.map(t=>parseInt(t[1]));
                if(idx===1) return 'kanchan';
                if(idx===0){ return nums[2]===9?'penchan':'ryanmen'; }
                if(idx===2){ return nums[0]===1?'penchan':'ryanmen'; }
            }
        }
        return 'ryanmen';
    }

    const WAIT_LABEL={ryanmen:'рянмэн',penchan:'пэнцан',kanchan:'канцан',tanki:'таньки',shanpon:'шанпон'};

    /* ══════════════════════════════════════════════════════════
       YAKU DETECTION
    ══════════════════════════════════════════════════════════ */
    function detectYaku(decomp, hand14, winTile, opt){
        const {isOpen,isRiichi,isDblRiichi,isIppatsu,isTsumo,roundWind,seatWind}=opt;
        const yaku=[]; const nh=hand14.map(norm);

        // Riichi / Double Riichi
        if(!isOpen){
            if(isDblRiichi) yaku.push({name:'Дабл-риичи',han:2,hanOpen:0});
            else if(isRiichi) yaku.push({name:'Риичи',han:1,hanOpen:0});
            if((isRiichi||isDblRiichi)&&isIppatsu) yaku.push({name:'Ипацу',han:1,hanOpen:0});
        }
        // Menzen Tsumo
        if(!isOpen&&isTsumo) yaku.push({name:'Мэнзэн цумо',han:1,hanOpen:0});

        // Tanyao
        if(nh.every(t=>!isTermHon(t))) yaku.push({name:'Танъяо',han:1,hanOpen:1});

        // Pinfu
        if(!isOpen&&decomp){
            const allChi=decomp.melds.every(m=>m.type==='chi');
            const rw='w'+roundWind, sw='w'+seatWind;
            const pairOk=!isHonor(decomp.pair)&&decomp.pair!==rw&&decomp.pair!==sw;
            const wt=waitType(decomp,winTile);
            if(allChi&&pairOk&&wt==='ryanmen') yaku.push({name:'Пинфу',han:1,hanOpen:0});
        }

        // Iipeiko / Ryanpeiko
        if(!isOpen&&decomp){
            const chis=decomp.melds.filter(m=>m.type==='chi');
            if(chis.length>=2){
                const keys=chis.map(m=>m.tiles.join(','));
                const grp={};
                keys.forEach(k=>grp[k]=(grp[k]||0)+1);
                const cnts=Object.values(grp);
                const pairs=cnts.filter(c=>c>=2).length;
                const quads=cnts.some(c=>c>=4);
                if(quads||(pairs>=2&&chis.length===4)) yaku.push({name:'Рянпэйко',han:3,hanOpen:0});
                else if(pairs>=1) yaku.push({name:'Иппэйко',han:1,hanOpen:0});
            }
        }

        // Yakuhai - dragons
        if(decomp){
            decomp.melds.filter(m=>m.type==='pon').forEach(m=>{
                if(m.tile==='dw') yaku.push({name:'Хаку 白',han:1,hanOpen:1});
                if(m.tile==='dg') yaku.push({name:'Хацу 發',han:1,hanOpen:1});
                if(m.tile==='dr') yaku.push({name:'Тю 中',han:1,hanOpen:1});
            });
        }

        // Yakuhai - winds
        if(decomp){
            const rw='w'+roundWind, sw='w'+seatWind;
            decomp.melds.filter(m=>m.type==='pon').forEach(m=>{
                if(m.tile===rw&&m.tile===sw) yaku.push({name:'Двойной ветер',han:2,hanOpen:2});
                else if(m.tile===rw) yaku.push({name:'Ветер раунда',han:1,hanOpen:1});
                else if(m.tile===sw) yaku.push({name:'Ветер игрока',han:1,hanOpen:1});
            });
        }

        // Toitoi
        if(decomp&&decomp.melds.every(m=>m.type==='pon')) yaku.push({name:'Тоитой',han:2,hanOpen:2});

        // San Ankou
        if(decomp){
            let cp=decomp.melds.filter(m=>m.type==='pon').length;
            if(!isTsumo&&decomp.melds.some(m=>m.type==='pon'&&m.tile===norm(winTile))) cp--;
            if(cp>=3) yaku.push({name:'Санантко',han:2,hanOpen:2});
        }

        // Chanta
        if(decomp){
            const pTH=isTermHon(decomp.pair);
            const mTH=decomp.melds.every(m=>m.type==='pon'?isTermHon(m.tile):m.tiles.some(t=>isTermHon(t)));
            const hasChi=decomp.melds.some(m=>m.type==='chi');
            if(pTH&&mTH&&hasChi) yaku.push({name:'Чантайяо',han:isOpen?1:2,hanOpen:1});
        }

        // Junchan
        if(decomp){
            const noHon=nh.every(t=>!isHonor(t));
            if(noHon){
                const pT=TILES[decomp.pair]&&TILES[decomp.pair].terminal;
                const mT=decomp.melds.every(m=>m.type==='pon'?(TILES[m.tile]&&TILES[m.tile].terminal):m.tiles.some(t=>TILES[t]&&TILES[t].terminal));
                const hasChi=decomp.melds.some(m=>m.type==='chi');
                if(pT&&mT&&hasChi) yaku.push({name:'Дзюн-чантайяо',han:isOpen?2:3,hanOpen:2});
            }
        }

        // Sanshoku Doujun
        if(decomp){
            const chis=decomp.melds.filter(m=>m.type==='chi');
            const byNums={};
            chis.forEach(m=>{
                const key=m.tiles.map(t=>t[1]).join(',');
                if(!byNums[key]) byNums[key]=new Set();
                byNums[key].add(m.tiles[0][0]);
            });
            for(const [,suits] of Object.entries(byNums)){
                if(suits.has('m')&&suits.has('p')&&suits.has('s')){
                    yaku.push({name:'Сан-сёку доджун',han:isOpen?1:2,hanOpen:1}); break;
                }
            }
        }

        // Sanshoku Doukou
        if(decomp){
            const pons=decomp.melds.filter(m=>m.type==='pon');
            const byNum={};
            pons.forEach(m=>{
                if('mps'.includes(m.tile[0])){
                    const k=m.tile[1];
                    if(!byNum[k]) byNum[k]=new Set();
                    byNum[k].add(m.tile[0]);
                }
            });
            for(const [,suits] of Object.entries(byNum)){
                if(suits.has('m')&&suits.has('p')&&suits.has('s')){
                    yaku.push({name:'Сан-сёку доко',han:2,hanOpen:2}); break;
                }
            }
        }

        // Ittsu
        if(decomp){
            const chis=decomp.melds.filter(m=>m.type==='chi');
            const bySuit={m:[],p:[],s:[]};
            chis.forEach(m=>{ const s=m.tiles[0][0]; if(bySuit[s]) bySuit[s].push(parseInt(m.tiles[0][1])); });
            for(const s of ['m','p','s']){
                if(bySuit[s].includes(1)&&bySuit[s].includes(4)&&bySuit[s].includes(7)){
                    yaku.push({name:'Иццу',han:isOpen?1:2,hanOpen:1}); break;
                }
            }
        }

        // Shosangen
        if(decomp){
            const dp=decomp.melds.filter(m=>m.type==='pon'&&m.tile[0]==='d').length;
            if(dp===2&&decomp.pair[0]==='d') yaku.push({name:'Сёсанкэй',han:2,hanOpen:2});
        }

        // Honitsu
        {
            const numSuits=new Set(nh.filter(t=>'mps'.includes(t[0])).map(t=>t[0]));
            if(numSuits.size===1&&nh.some(t=>isHonor(t))) yaku.push({name:'Хонъицу',han:isOpen?2:3,hanOpen:2});
        }

        // Chinitsu
        {
            const numSuits=new Set(nh.filter(t=>'mps'.includes(t[0])).map(t=>t[0]));
            if(numSuits.size===1&&!nh.some(t=>isHonor(t))) yaku.push({name:'Чинъицу',han:isOpen?5:6,hanOpen:5});
        }

        return yaku;
    }

    function detectYakuman(decomp, hand14, winTile, opt){
        const {isOpen,isTsumo}=opt;
        const nh=hand14.map(norm);
        const ym=[];

        // Tsuuiisou - all honors
        if(nh.every(t=>isHonor(t))) ym.push({name:'Сю-ит-то (Все почётные)',han:13});

        // Ryuuiisou - all green
        const GREEN=new Set(['s2','s3','s4','s6','s8','dg']);
        if(nh.every(t=>GREEN.has(t))) ym.push({name:'Рю-исо (Зелёная роща)',han:13});

        // Chinroutou - all terminals
        const TERM9=new Set(['m1','m9','p1','p9','s1','s9']);
        if(nh.every(t=>TERM9.has(t))) ym.push({name:'Чин-ро-то (Все терминалы)',han:13});

        if(decomp){
            // Daisangen - big 3 dragons
            const dp=decomp.melds.filter(m=>m.type==='pon'&&m.tile[0]==='d').length;
            if(dp===3) ym.push({name:'Дайсандзэн (3 дракона)',han:13});

            // Shosuushi / Daisuushi
            const wp=decomp.melds.filter(m=>m.type==='pon'&&m.tile[0]==='w').length;
            if(wp===4) ym.push({name:'Дайсуши (4 ветра)',han:13});
            else if(wp===3&&decomp.pair[0]==='w') ym.push({name:'Сёсанфу (Малые 4 ветра)',han:13});

            // Suuankou
            if(!isOpen&&decomp.melds.every(m=>m.type==='pon')){
                const wn=norm(winTile);
                if(decomp.pair===wn&&!isTsumo) ym.push({name:'Сыу-антко (таньки)',han:26,isDouble:true});
                else if(isTsumo) ym.push({name:'Сыу-антко',han:13});
            }

            // Suukantsu — only if all 4 melds are kans (simplified: check via counts)
        }

        return ym;
    }

    /* ══════════════════════════════════════════════════════════
       FU CALCULATION
    ══════════════════════════════════════════════════════════ */
    function calcFu(decomp, winTile, opt, yakuList){
        const {isOpen,isTsumo,roundWind,seatWind}=opt;
        const hasPinfu=yakuList.some(y=>y.name==='Пинфу');
        if(hasPinfu&&isTsumo) return {total:20,breakdown:['Пинфу + цумо = 20 фу (фиксировано)']};

        let fu=isOpen?20:30;
        const bd=[fu+' фу (база)'];
        if(!isOpen&&!isTsumo){ fu+=10; bd.push('+10 фу (закр. рон)'); }
        if(isTsumo&&!hasPinfu){ fu+=2; bd.push('+2 фу (цумо)'); }

        const wt=waitType(decomp,winTile);
        if(['kanchan','penchan','tanki'].includes(wt)){ fu+=2; bd.push('+2 фу (ожидание: '+WAIT_LABEL[wt]+')'); }

        const p=decomp.pair;
        const rw='w'+roundWind, sw='w'+seatWind;
        if(p===rw&&p===sw){ fu+=4; bd.push('+4 фу (пара двойного ветра)'); }
        else if(p===rw||p===sw){ fu+=2; bd.push('+2 фу (пара ветра)'); }
        else if(p[0]==='d'){ fu+=2; bd.push('+2 фу (пара дракона)'); }

        for(const m of decomp.melds){
            if(m.type==='pon'){
                const th=isTermHon(m.tile);
                const cl=!isOpen;
                const mfu=th?(cl?8:4):(cl?4:2);
                fu+=mfu;
                bd.push('+'+mfu+' фу (понг '+(th?'терминал':'простой')+', '+(cl?'закр.':'откр.')+')');
            }
        }

        const rounded=Math.ceil(fu/10)*10;
        if(rounded!==fu) bd.push('→ Округление до '+rounded);
        return {total:rounded,breakdown:bd};
    }

    /* ══════════════════════════════════════════════════════════
       PAYMENT CALCULATION
    ══════════════════════════════════════════════════════════ */
    function ceil100(n){ return Math.ceil(n/100)*100; }

    function calcPayments(han, fu, isDealer, isTsumo, honbo){
        let p={};
        if(han>=26){
            p.label='Двойной якуман';
            if(isDealer){ p.ron=96000; p.tsumoEach=32000; }
            else{ p.ron=64000; p.tsumoDealer=32000; p.tsumoOthers=16000; }
        } else if(han>=13){
            p.label='Якуман';
            if(isDealer){ p.ron=48000; p.tsumoEach=16000; }
            else{ p.ron=32000; p.tsumoDealer=16000; p.tsumoOthers=8000; }
        } else if(han>=11){
            p.label='Сан-бай-ман';
            if(isDealer){ p.ron=36000; p.tsumoEach=12000; }
            else{ p.ron=24000; p.tsumoDealer=12000; p.tsumoOthers=6000; }
        } else if(han>=8){
            p.label='Бай-ман';
            if(isDealer){ p.ron=24000; p.tsumoEach=8000; }
            else{ p.ron=16000; p.tsumoDealer=8000; p.tsumoOthers=4000; }
        } else if(han>=6){
            p.label='Ханэ-ман';
            if(isDealer){ p.ron=18000; p.tsumoEach=6000; }
            else{ p.ron=12000; p.tsumoDealer=6000; p.tsumoOthers=3000; }
        } else if(han>=5||(han===4&&fu>=30)||(han===3&&fu>=70)){
            p.label='Манган';
            if(isDealer){ p.ron=12000; p.tsumoEach=4000; }
            else{ p.ron=8000; p.tsumoDealer=4000; p.tsumoOthers=2000; }
        } else {
            const base=fu*Math.pow(2,han+2);
            if(isDealer){
                p.ron=ceil100(base*6);
                p.tsumoEach=ceil100(base*2);
            } else {
                p.ron=ceil100(base*4);
                p.tsumoDealer=ceil100(base*2);
                p.tsumoOthers=ceil100(base*1);
            }
        }
        const hb=honbo*300;
        if(hb){ p.ron=(p.ron||0)+hb; if(p.tsumoEach) p.tsumoEach+=hb; if(p.tsumoDealer) p.tsumoDealer+=honbo*100; if(p.tsumoOthers) p.tsumoOthers+=honbo*100; }
        return p;
    }

    /* ══════════════════════════════════════════════════════════
       MAIN CALCULATOR
    ══════════════════════════════════════════════════════════ */
    function calculate(){
        if(state.hand.length!==14) return null;
        const hand=state.hand;
        const winTile=hand[hand.length-1];
        const opt={isOpen:state.isOpen,isRiichi:state.isRiichi,isDblRiichi:state.isDblRiichi,isIppatsu:state.isIppatsu,isTsumo:state.isTsumo,roundWind:state.roundWind,seatWind:state.seatWind};
        const akaDora=hand.filter(t=>t==='m0'||t==='p0'||t==='s0').length;
        const totalBonus=state.dora+(state.isRiichi||state.isDblRiichi?state.uraDora:0)+akaDora;
        const isDealer=state.seatWind==='e';

        // Chiitoitsu
        if(isChiitoitsu(hand)){
            let yaku=[{name:'Чи-тои-цу (7 пар)',han:2,hanOpen:0}];
            if(!opt.isOpen&&opt.isDblRiichi) yaku.push({name:'Дабл-риичи',han:2,hanOpen:0});
            else if(!opt.isOpen&&opt.isRiichi) yaku.push({name:'Риичи',han:1,hanOpen:0});
            if((opt.isRiichi||opt.isDblRiichi)&&opt.isIppatsu) yaku.push({name:'Ипацу',han:1,hanOpen:0});
            const han=yaku.reduce((s,y)=>s+y.han,0)+totalBonus;
            return {type:'chiitoitsu',yakuList:yaku,han,fu:25,fuBreakdown:['25 фу (фиксировано)'],payments:calcPayments(han,25,isDealer,opt.isTsumo,state.honbo),akaDora,totalBonus};
        }

        // Kokushi
        if(!opt.isOpen&&isKokushi(hand)){
            const han=13;
            return {type:'yakuman',yakuList:[{name:'Кокуши мусо',han:13,isYakuman:true}],han,payments:calcPayments(han,0,isDealer,opt.isTsumo,state.honbo),akaDora,totalBonus};
        }

        const decomps=allDecomps(hand);
        if(!decomps||!decomps.length) return {type:'invalid',error:'Рука не является победной'};

        let best=null, bestScore=-1;

        for(const d of decomps){
            // Check yakuman first
            const ym=detectYakuman(d,hand,winTile,opt);
            if(ym.length){
                const han=ym.reduce((s,y)=>s+y.han,0);
                const pmts=calcPayments(han,0,isDealer,opt.isTsumo,state.honbo);
                const score=opt.isTsumo?(isDealer?(pmts.tsumoEach||0)*3:(pmts.tsumoDealer||0)+(pmts.tsumoOthers||0)*2):(pmts.ron||0);
                if(score>bestScore){ bestScore=score; best={type:'yakuman',yakuList:ym,han,payments:pmts,akaDora,totalBonus}; }
                continue;
            }

            const allYaku=detectYaku(d,hand,winTile,opt);
            const validYaku=allYaku.filter(y=>!opt.isOpen||(y.hanOpen>0));
            if(!validYaku.length&&totalBonus===0) continue;
            if(!validYaku.length) continue; // dora alone = no win

            const fuRes=calcFu(d,winTile,opt,validYaku);
            let han=validYaku.reduce((s,y)=>s+(opt.isOpen?y.hanOpen:y.han),0)+totalBonus;
            const pmts=calcPayments(han,fuRes.total,isDealer,opt.isTsumo,state.honbo);
            const score=opt.isTsumo?(isDealer?(pmts.tsumoEach||0)*3:(pmts.tsumoDealer||0)+(pmts.tsumoOthers||0)*2):(pmts.ron||0);
            if(score>bestScore){ bestScore=score; best={type:'normal',decomp:d,yakuList:validYaku,han,fu:fuRes.total,fuBreakdown:fuRes.breakdown,payments:pmts,akaDora,totalBonus}; }
        }

        return best || {type:'invalid',error:'Нет яку — рука не засчитывается'};
    }

    /* ══════════════════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════════════════ */
    /* ── Drag state ──────────────────────────────────────────── */
    var drag = { src: null, srcIdx: -1, fromPalette: false };

    function tileBtn(id, cls, clickFn, extra){
        const t=TILES[id]; if(!t) return null;
        const btn=document.createElement('button');
        btn.className='con-tile '+cls;
        btn.dataset.id=id;
        btn.title=t.label;
        const img=document.createElement('img');
        img.src=IMG+t.img; img.alt=t.label;
        btn.appendChild(img);
        if(extra) extra(btn,t);
        btn.addEventListener('click',()=>clickFn(id,btn));
        return btn;
    }

    function renderPalette(){
        for(const [group, ids] of PALETTE_ORDER){
            const row=document.getElementById('palette-'+group);
            if(!row) continue;
            row.innerHTML='';
            ids.forEach(id=>{
                const btn=tileBtn(id,'con-tile--palette',addTile,(b)=>{
                    const badge=document.createElement('span');
                    badge.className='con-tile__count';
                    badge.style.display='none';
                    b.appendChild(badge);
                });
                if(!btn) return;
                // Drag from palette → hand (or replace when hand is full)
                btn.draggable=true;
                btn.addEventListener('dragstart',e=>{
                    if(copiesLeft(id)<=0){ e.preventDefault(); return; }
                    drag.fromPalette=true; drag.src=id; drag.srcIdx=-1;
                    e.dataTransfer.effectAllowed='copy';
                    btn.classList.add('is-dragging');
                });
                btn.addEventListener('dragend',()=>btn.classList.remove('is-dragging'));
                row.appendChild(btn);
            });
        }
        syncPalette();
    }

    function syncPalette(){
        document.querySelectorAll('.con-tile--palette').forEach(btn=>{
            const left=copiesLeft(btn.dataset.id);
            const used=4-left;
            btn.disabled=left<=0;
            btn.classList.toggle('is-exhausted',left<=0);
            const badge=btn.querySelector('.con-tile__count');
            if(badge){ badge.textContent=used||''; badge.style.display=used?'':'none'; }
        });
    }

    function makeLabel(){
        const lbl=document.createElement('div');
        lbl.className='con-hand-label';
        const cnt=document.createElement('span');
        cnt.id='tile-count';
        cnt.textContent=state.hand.length;
        lbl.appendChild(document.createTextNode('Рука — '));
        lbl.appendChild(cnt);
        lbl.appendChild(document.createTextNode(' из 14'));
        return lbl;
    }

    function renderHand(){
        const el=document.getElementById('con-hand');

        if(!state.hand.length){
            el.innerHTML='';
            el.appendChild(makeLabel());
            const empty=document.createElement('div');
            empty.className='con-hand__empty';
            empty.textContent='Перетащите или нажмите на тайл в палитре слева';
            el.appendChild(empty);
            setupHandDrop(el);
            return;
        }

        el.innerHTML='';
        el.appendChild(makeLabel());
        state.hand.forEach((id,idx)=>{
            // Group separators: before index 3, 6, 9 (melds) and 12 (pair)
            if([3,6,9,12].includes(idx)){
                const sep=document.createElement('div');
                sep.className='con-hand__sep';
                if(idx===12) sep.classList.add('con-hand__sep--pair');
                el.appendChild(sep);
            }
            const isWin=idx===state.hand.length-1&&state.hand.length===14;
            const btn=tileBtn(id,'con-tile--hand'+(isWin?' con-tile--win':''),()=>removeTile(idx),(b)=>{
                if(isWin){ const lbl=document.createElement('span'); lbl.className='con-tile__win-label'; lbl.textContent=state.isTsumo?'Цумо':'Рон'; b.appendChild(lbl); }
            });
            if(!btn) return;

            // Drag within hand to reorder / discard
            btn.draggable=true;
            btn.dataset.idx=idx;
            btn.addEventListener('dragstart',e=>{
                drag.fromPalette=false; drag.src=id; drag.srcIdx=idx;
                e.dataTransfer.effectAllowed='move';
                btn.classList.add('is-dragging');
                document.body.classList.add('hand-dragging');
            });
            btn.addEventListener('dragend',()=>{
                btn.classList.remove('is-dragging');
                document.body.classList.remove('hand-dragging');
                document.querySelectorAll('.con-tile--hand').forEach(b=>b.classList.remove('drag-over'));
            });
            btn.addEventListener('dragover',e=>{
                e.preventDefault();
                e.dataTransfer.dropEffect=drag.fromPalette?'copy':'move';
                document.querySelectorAll('.con-tile--hand').forEach(b=>b.classList.remove('drag-over'));
                btn.classList.add('drag-over');
            });
            btn.addEventListener('dragleave',()=>btn.classList.remove('drag-over'));
            btn.addEventListener('drop',e=>{
                e.preventDefault(); e.stopPropagation();
                btn.classList.remove('drag-over');
                const targetIdx=parseInt(btn.dataset.idx);
                if(drag.fromPalette){
                    if(copiesLeft(drag.src)<=0) return;
                    if(state.hand.length>=14){
                        // Replace the tile under cursor
                        state.hand.splice(targetIdx,1,drag.src);
                    } else {
                        state.hand.splice(targetIdx,0,drag.src);
                    }
                } else {
                    if(drag.srcIdx===targetIdx) return;
                    const [tile]=state.hand.splice(drag.srcIdx,1);
                    const insertAt=drag.srcIdx<targetIdx?targetIdx:targetIdx;
                    state.hand.splice(insertAt,0,tile);
                }
                update();
            });

            el.appendChild(btn);
        });

        setupHandDrop(el);
    }

    /* Удаление тайла: бросить за пределы руки — тайл исчезает */
    function setupDocumentDiscard(){
        document.addEventListener('dragover',e=>{
            if(drag.fromPalette||drag.srcIdx<0) return;   // только тайлы из руки
            const handEl=document.getElementById('con-hand');
            if(handEl&&handEl.contains(e.target)) return; // внутри руки — не перехватывать
            e.preventDefault();
            e.dataTransfer.dropEffect='move';
        });
        document.addEventListener('drop',e=>{
            if(drag.fromPalette||drag.srcIdx<0) return;
            const handEl=document.getElementById('con-hand');
            if(handEl&&handEl.contains(e.target)) return; // обработает рука
            e.preventDefault();
            const idx=drag.srcIdx;
            drag.srcIdx=-1;
            state.hand.splice(idx,1);
            update();
        });
    }

    function setupHandDrop(el){
        el.addEventListener('dragover',e=>{ e.preventDefault(); e.dataTransfer.dropEffect=drag.fromPalette?'copy':'move'; el.classList.add('drag-active'); });
        el.addEventListener('dragleave',e=>{ if(!el.contains(e.relatedTarget)) el.classList.remove('drag-active'); });
        el.addEventListener('drop',e=>{
            e.preventDefault(); e.stopPropagation(); el.classList.remove('drag-active');
            // Only handle drop on the hand background (not on a tile)
            if(e.target.closest('.con-tile--hand')) return;
            if(drag.fromPalette){
                if(copiesLeft(drag.src)<=0||state.hand.length>=14) return;
                state.hand.push(drag.src);
            } else {
                // Move to end
                if(drag.srcIdx<0) return;
                const [tile]=state.hand.splice(drag.srcIdx,1);
                state.hand.push(tile);
            }
            update();
        });
    }

    function fmtN(n){ return n!==undefined?n.toLocaleString('ru-RU')+' ⊙':'—'; }

    function renderResults(){
        const el=document.getElementById('con-results');
        if(!el) return;
        if(state.hand.length<14){
            const need=14-state.hand.length;
            el.innerHTML='<div class="con-results__placeholder">Не хватает <strong>'+need+'</strong> '+(need===1?'тайла':need<5?'тайла':'тайлов')+'</div>';
            return;
        }
        const r=calculate();
        if(!r){ el.innerHTML='<div class="con-results__invalid">Ошибка расчёта</div>'; return; }
        if(r.type==='invalid'){ el.innerHTML='<div class="con-results__invalid">⚠ '+r.error+'</div>'; return; }

        const p=r.payments; const isDealer=state.seatWind==='e';

        /* ── Главная выплата (всегда видна) ── */
        let h='<div class="con-results__hero">';
        if(p.label) h+='<div class="con-results__hero-limit">'+p.label+'</div>';
        if(r.type!=='yakuman') h+='<div class="con-results__hero-meta">'+r.han+' хан'+(r.fu?' · '+r.fu+' фу':'')+'</div>';
        h+='<div class="con-results__hero-pays">';
        if(p.ron!==undefined)      h+='<div class="con-results__hero-pay"><span>'+(isDealer?'Дилер рон':'Рон')+'</span><strong>'+fmtN(p.ron)+'</strong></div>';
        if(isDealer&&p.tsumoEach!==undefined) h+='<div class="con-results__hero-pay"><span>Цумо (каждый)</span><strong>'+fmtN(p.tsumoEach)+'</strong></div>';
        if(!isDealer&&p.tsumoDealer!==undefined) h+='<div class="con-results__hero-pay"><span>Цумо дилер&thinsp;/&thinsp;остальные</span><strong>'+fmtN(p.tsumoDealer)+'&thinsp;/&thinsp;'+fmtN(p.tsumoOthers)+'</strong></div>';
        if(state.honbo>0) h+='<div class="con-results__hero-pay con-results__honbo"><span>+хомбо ×'+state.honbo+'</span><strong>+'+fmtN(state.honbo*300)+'</strong></div>';
        h+='</div></div>';

        /* ── Детали (раскрывающийся блок) ── */
        h+='<details class="con-results__accordion"><summary class="con-results__accordion-toggle">Подробнее</summary><div class="con-results__accordion-body">';

        // Яку
        h+='<div class="con-results__yaku"><div class="con-results__section-title">Яку</div>';
        r.yakuList.forEach(y=>{
            const han=state.isOpen?(y.hanOpen!==undefined?y.hanOpen:y.han):y.han;
            h+='<div class="con-results__yaku-row"><span class="con-results__yaku-name">'+y.name+'</span><span class="con-results__yaku-han">'+(y.isYakuman?'якуман':han+' хан')+'</span></div>';
        });
        if(state.dora>0) h+='<div class="con-results__yaku-row"><span class="con-results__yaku-name">Дора</span><span class="con-results__yaku-han">+'+state.dora+' хан</span></div>';
        if((state.isRiichi||state.isDblRiichi)&&state.uraDora>0) h+='<div class="con-results__yaku-row"><span class="con-results__yaku-name">Ура-дора</span><span class="con-results__yaku-han">+'+state.uraDora+' хан</span></div>';
        if(r.akaDora>0) h+='<div class="con-results__yaku-row"><span class="con-results__yaku-name">Красная дора</span><span class="con-results__yaku-han">+'+r.akaDora+' хан</span></div>';
        h+='</div>';

        // Хан / Фу итог
        if(r.type!=='yakuman'){
            h+='<div class="con-results__totals">';
            h+='<div class="con-results__total-item"><span>Хан</span><strong>'+r.han+'</strong></div>';
            if(r.fu) h+='<div class="con-results__total-item"><span>Фу</span><strong>'+r.fu+'</strong></div>';
            h+='</div>';
        }

        // Разбивка фу
        if(r.fuBreakdown&&r.fuBreakdown.length){
            h+='<details class="con-results__fu-details"><summary>Разбивка фу</summary><ul>';
            r.fuBreakdown.forEach(l=>{ h+='<li>'+l+'</li>'; });
            h+='</ul></details>';
        }

        h+='</div></details>';
        el.innerHTML=h;
    }

    /* ══════════════════════════════════════════════════════════
       ACTIONS
    ══════════════════════════════════════════════════════════ */
    function addTile(id){ if(state.hand.length>=14||copiesLeft(id)<=0) return; state.hand.push(id); update(); }
    function removeTile(idx){ state.hand.splice(idx,1); update(); }
    function update(){ syncPalette(); renderHand(); renderResults(); save(); }

    /* ══════════════════════════════════════════════════════════
       PERSISTENCE
    ══════════════════════════════════════════════════════════ */
    function save(){ try{ localStorage.setItem('mj-con',JSON.stringify(state)); }catch(e){} }
    function load(){
        try{
            const s=localStorage.getItem('mj-con');
            if(s) Object.assign(state,JSON.parse(s));
        }catch(e){}
        // If hand is empty (first visit or cleared storage), show example hand
        if(!state.hand||state.hand.length===0) state.hand=DEFAULT_HAND.slice();
    }

    /* ══════════════════════════════════════════════════════════
       CONTROLS INIT
    ══════════════════════════════════════════════════════════ */
    function windGroup(containerId, stateKey){
        const grp=document.getElementById(containerId);
        if(!grp) return;
        grp.querySelectorAll('.con-btn--wind').forEach(btn=>{
            btn.classList.toggle('is-active',btn.dataset.wind===state[stateKey]);
            btn.addEventListener('click',()=>{
                grp.querySelectorAll('.con-btn--wind').forEach(b=>b.classList.remove('is-active'));
                btn.classList.add('is-active');
                state[stateKey]=btn.dataset.wind;
                update();
            });
        });
    }

    function togglePair(id1, id2, stateKey, val1, val2){
        const b1=document.getElementById(id1), b2=document.getElementById(id2);
        if(!b1||!b2) return;
        const sync=()=>{ b1.classList.toggle('is-active',!state[stateKey]); b2.classList.toggle('is-active',state[stateKey]); };
        b1.addEventListener('click',()=>{ state[stateKey]=false; sync(); update(); });
        b2.addEventListener('click',()=>{ state[stateKey]=true; sync(); update(); });
        sync();
    }

    function counter(name, stateKey, min, max){
        const dec=document.getElementById(name+'-dec'), inc=document.getElementById(name+'-inc'), val=document.getElementById(name+'-val');
        if(!dec||!inc||!val) return;
        val.textContent=state[stateKey]||0;
        dec.addEventListener('click',()=>{ if(state[stateKey]>min){ state[stateKey]--; val.textContent=state[stateKey]; update(); } });
        inc.addEventListener('click',()=>{ if(state[stateKey]<max){ state[stateKey]++; val.textContent=state[stateKey]; update(); } });
    }

    function initControls(){
        windGroup('round-wind-btns','roundWind');
        windGroup('seat-wind-btns','seatWind');
        togglePair('btn-ron','btn-tsumo','isTsumo');
        togglePair('btn-closed','btn-open','isOpen');
        counter('honbo','honbo',0,20);
        counter('dora','dora',0,12);
        counter('uradora','uraDora',0,12);

        // Riichi
        const btnR=document.getElementById('btn-riichi');
        const btnI=document.getElementById('btn-ippatsu');
        const btnD=document.getElementById('btn-dbl-riichi');
        const syncRiichi=()=>{
            btnR.classList.toggle('is-active',state.isRiichi&&!state.isDblRiichi);
            btnD.classList.toggle('is-active',state.isDblRiichi);
            btnI.classList.toggle('is-active',state.isIppatsu);
            btnI.disabled=!state.isRiichi&&!state.isDblRiichi;
        };
        btnR.addEventListener('click',()=>{ state.isRiichi=!state.isRiichi; if(!state.isRiichi){state.isIppatsu=false;state.isDblRiichi=false;} syncRiichi(); update(); });
        btnD.addEventListener('click',()=>{ state.isDblRiichi=!state.isDblRiichi; if(state.isDblRiichi) state.isRiichi=true; else state.isRiichi=false; state.isIppatsu=false; syncRiichi(); update(); });
        btnI.addEventListener('click',()=>{ if(!state.isRiichi&&!state.isDblRiichi) return; state.isIppatsu=!state.isIppatsu; syncRiichi(); update(); });
        syncRiichi();

        // Open hand disables riichi
        document.getElementById('btn-open')&&document.getElementById('btn-open').addEventListener('click',()=>{
            if(state.isOpen){ state.isRiichi=false; state.isDblRiichi=false; state.isIppatsu=false; syncRiichi(); }
        });

        document.getElementById('btn-sort')&&document.getElementById('btn-sort').addEventListener('click',()=>{ state.hand=sortHand(state.hand); update(); });
        document.getElementById('btn-clear')&&document.getElementById('btn-clear').addEventListener('click',()=>{ state.hand=[]; update(); });
    }

    /* ══════════════════════════════════════════════════════════
       INIT
    ══════════════════════════════════════════════════════════ */
    document.addEventListener('DOMContentLoaded',function(){
        load();
        renderPalette();
        initControls();
        setupDocumentDiscard();
        renderHand();
        renderResults();
    });

})();
