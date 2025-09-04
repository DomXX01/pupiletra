import React, { useCallback, useRef, useState } from "react";

// Palabras del pupiletra 🐱
const DEFAULT_WORDS = [
  "LIAM","HARRY","ZAYN","LOUIS","NIALL","GATOS","WILLUMP","NUNU","JAUJA","NALA",
  "RODO","COCO","GRETA","BOBIS","ESTERNOCLLEIDOMASTOIDEO","NEGRO","BLANCO","ARQUITECTURA",
  "MAKIS","PIZZA","MALECON","BESOS","HELADO","GUIÑO"
];

const DIRECTIONS = [
  [0, 1], [1, 0], [0, -1], [-1, 0],
  [1, 1], [1, -1], [-1, 1], [-1, -1]
];

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function createEmptyGrid(size) { return Array.from({ length: size }, () => Array.from({ length: size }, () => ({ letter: "", found: false }))); }

function placeWordsOnGrid(words, size) {
  const grid = createEmptyGrid(size);
  const placedWords = [];

  const tryPlaceWord = (word) => {
    for (let a=0;a<300;a++){
      const [dr,dc] = DIRECTIONS[Math.floor(Math.random()*DIRECTIONS.length)];
      const r = randInt(0,size-1), c=randInt(0,size-1);
      const endR = r + dr*(word.length-1), endC = c + dc*(word.length-1);
      if(endR<0||endR>=size||endC<0||endC>=size) continue;
      let ok=true;
      for(let i=0;i<word.length;i++){
        const rr=r+dr*i,cc=c+dc*i;
        const cur=grid[rr][cc].letter;
        if(cur!==""&&cur!==word[i]){ok=false;break;}
      }
      if(!ok) continue;
      const pos=[];
      for(let i=0;i<word.length;i++){
        const rr=r+dr*i,cc=c+dc*i;
        grid[rr][cc].letter=word[i];
        pos.push([rr,cc]);
      }
      placedWords.push({word,positions:pos,found:false});
      return true;
    }
    return false;
  };

  [...words].sort((a,b)=>b.length-a.length).forEach(w=>{
    const ww=w.toUpperCase();
    if(!tryPlaceWord(ww)){
      tryPlaceWord(ww.split("").reverse().join(""));
    }
  });

  const letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for(let r=0;r<size;r++){
    for(let c=0;c<size;c++){
      if(grid[r][c].letter==="")
        grid[r][c].letter=letters[Math.floor(Math.random()*letters.length)];
    }
  }
  return {grid,placedWords};
}

export default function App({ initialWords = DEFAULT_WORDS, size=20, completionImage }){
  const [words] = useState(initialWords.map(w=>w.toUpperCase()));
  const [gridSize] = useState(size);
  const [puzzle,setPuzzle] = useState(()=>placeWordsOnGrid(words,gridSize));
  const [foundWords,setFoundWords]=useState([]);
  const [selection,setSelection]=useState([]);
  const [moves,setMoves]=useState(0);
  const selectingRef=useRef(false);
  const selDirRef=useRef(null);

  const regenerate = useCallback(()=>{
    setPuzzle(placeWordsOnGrid(words,gridSize));
    setFoundWords([]);
    setSelection([]);
    setMoves(0);
  },[words,gridSize]);

  const reveal = useCallback(()=>{
    setPuzzle(prev=>{
      const g=prev.grid.map(r=>r.map(c=>({...c})));
      const pw=prev.placedWords.map(w=>({...w,found:true}));
      pw.forEach(wordObj=>{
        wordObj.positions.forEach(([r,c])=>{g[r][c].found=true;});
      });
      return{grid:g,placedWords:pw};
    });
    setFoundWords(words);
  },[words]);

  const printSolution = useCallback(()=>{window.print();},[]);

  const onPointerDown=(r,c)=>(e)=>{
    e.preventDefault();
    selectingRef.current=true;
    selDirRef.current=null;
    setSelection([[r,c]]);
  };

  const onPointerEnter=(r,c)=>(e)=>{
    if(!selectingRef.current) return;
    setSelection(prev=>{
      if(prev.length===0) return [[r,c]];
      const last=prev[prev.length-1];
      if(prev.length===1){
        const dr=r-prev[0][0],dc=c-prev[0][1];
        const stepR=dr===0?0:dr/Math.abs(dr);
        const stepC=dc===0?0:dc/Math.abs(dc);
        selDirRef.current=[stepR,stepC];
        if(Math.max(Math.abs(dr),Math.abs(dc))>1)return prev;
        return [[...prev[0]],[r,c]];
      } else {
        const [sr,sc]=selDirRef.current||[0,0];
        const lastR=last[0]+sr,lastC=last[1]+sc;
        if(lastR===r&&lastC===c) return [...prev,[r,c]];
        return prev;
      }
    });
  };

  const onPointerUp=()=>{
    selectingRef.current=false;
    if(selection.length<2){setSelection([]);return;}
    const word=selection.map(([r,c])=>puzzle.grid[r][c].letter).join("");
    const wordRev=word.split("").reverse().join("");
    const match=puzzle.placedWords.find(pw=>!pw.found&&(pw.word===word||pw.word===wordRev));
    if(match){
      setMoves(m=>m+1);
      setPuzzle(prev=>{
        const g=prev.grid.map(row=>row.map(cell=>({...cell})));
        const pwList=prev.placedWords.map(pw=>({...pw}));
        const target=pwList.find(p=>p.word===match.word);
        if(target) target.found=true;
        for(const [r,c] of match.positions){g[r][c].found=true;}
        return{grid:g,placedWords:pwList};
      });
      setFoundWords(prev=>[...new Set([...prev,match.word])]);
    }
    setSelection([]);
  };

  const isCellSelected=(r,c)=>selection.some(([sr,sc])=>sr===r&&sc===c);
  const allFound=puzzle.placedWords.length>0 && puzzle.placedWords.every(w=>w.found);

  return(
    <div className="p-6 max-w-5xl mx-auto font-sans min-h-screen bg-pink-50 relative"
      style={{ backgroundImage: "url('https://placekitten.com/900/900')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-pink-700">🐱 Pupiletra Michi</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-pink-300 text-pink-900 rounded" onClick={regenerate}>Regenerar</button>
            <button className="px-3 py-1 bg-purple-300 text-purple-900 rounded" onClick={reveal}>Revelar</button>
            <button className="px-3 py-1 bg-blue-200 text-blue-900 rounded" onClick={printSolution}>Imprimir</button>
          </div>
        </div>

        <div className="flex gap-6 flex-col md:flex-row">
          <div>
            <div className="inline-block bg-white p-3 rounded-xl shadow">
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${gridSize}, 26px)`, gap: 2 }}>
                {puzzle.grid.map((row,r)=>row.map((cell,c)=>{
                  const sel=isCellSelected(r,c);
                  return(
                    <div key={`${r}-${c}`} onPointerDown={onPointerDown(r,c)} onPointerEnter={onPointerEnter(r,c)} onPointerUp={onPointerUp}
                      className={`w-6 h-6 flex items-center justify-center border rounded-md select-none ${cell.found?'bg-green-200':sel?'bg-pink-200':'bg-white'} text-slate-700`}>
                      <span className="font-mono text-[10px]">{cell.letter}</span>
                    </div>
                  );}))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white/80 p-3 rounded-xl shadow">
              <h3 className="font-semibold text-pink-700">Palabras</h3>
              <ul className="mt-2 space-y-1 text-slate-700">
                {puzzle.placedWords.map(pw=>(<li key={pw.word} className={`${pw.found?'line-through text-slate-400':''}`}>{pw.word}</li>))}
              </ul>
              <div className="mt-4 text-sm text-slate-600">
                <p>Movimientos: <strong>{moves}</strong></p>
                <p>Palabras encontradas: <strong>{foundWords.length}</strong> / {puzzle.placedWords.length}</p>
              </div>
            </div>
          </div>
        </div>

        {allFound && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center relative z-10">
            <p className="text-lg text-pink-700 font-bold">¡Muy bien amorcito!🥳 Pero igual sigue siendo bobis jijijij ❤</p>
            {completionImage && (
              <div className="mt-4">
                <img src={completionImage} alt="Imagen de celebración" className="mx-auto rounded-xl shadow-md max-h-64" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
