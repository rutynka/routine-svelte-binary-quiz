<script>
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Progress from '@rutynka/helper-progress';
	import Bar from '@rutynka/helper-bar-board';

	let allTheFish = {itemListElement:[]}

	const questionsInterval = 5000
	let quizData = []
	let quizDataCorrect = []
	let quizDataWrong = []
	let cycle = 0
	let correct = 0
	let wrong = 0
	let current = ''
	let interval = {}
	let showFalseText = true;
	let randText = 0

	let showDesc = false;

	let prgs;
	let bb;

	console.log('Warning!! This code is not 100% Svelte way which is intended.')

	function handlePressEvent(logic) {
		let answer = bb.question;
		console.log("answer: " + logic + " falseText:" + showFalseText + " cycle:" + cycle);
		if ( logic !== showFalseText ) {
			correct++;
			bb.set_correct(answer);
			showCorrectAnswer()

		} else {
			bb.set_wrong(bb.question, answer);
			showWrongAnswer()
			wrong++;
		}

		if (correct + wrong === allTheFish.itemListElement.length) {
			console.log('correct + wrong:', correct, "+", wrong)
			stopQuestionsAndWin();
			bb.set_timer = false
		} else {
			startTimerQuestions();
		}
	}

	function pressedEvent(e) {
        const keyName = e.key;
        console.log('logic press button: ' + keyName);
        if (keyName === 'Control' && e.location === 1 || e.target.id === 'btnTrue') {
            document.getElementById('btnTrue').classList.add('btn-pressed');
            window.setTimeout(btnHoverRemove, 300);
            handlePressEvent(true)
        }
        if (keyName === 'Control' && e.location === 2 || e.target.id === 'btnFalse' ) {
            document.getElementById('btnFalse').classList.add('btn-pressed');
            window.setTimeout(btnHoverRemove, 300);
            handlePressEvent(false)
        }

    }

	function stopQuestionsAndWin () {
		console.log('Win')
		clearInterval(interval);
		prgs.store_progress({collectionName:allTheFish.name,exerciseTime:bb.get_timer()})
		bb.question = 'Excellent !'
		document.body.classList.add('bg-correct')
		document.removeEventListener('keyup', pressedEvent);
	}

	function shuffle(a) {
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}


	function showCorrectAnswer() {
		quizDataCorrect.unshift(quizData[cycle])
		quizDataCorrect = [...quizDataCorrect]
	}

	function showWrongAnswer() {
		quizDataWrong.unshift(quizData[cycle])
		quizDataWrong = [...quizDataWrong]
	}

	function btnHoverRemove() {
        document.getElementById('btnTrue').classList.remove('btn-pressed');
        document.getElementById('btnFalse').classList.remove('btn-pressed');
    }

	function showNextImage() {
		quizData = [...quizData]
	}

	function cycleText () {
		cycle++;
		if (quizData.length <= cycle) {
			cycle = 0;
			console.log(quizData.length , 'reset');
		}
		if (quizData.length === 1) {
			showFalseText = false;
		} else {
			showFalseText = Math.random() < 0.5 ? true : false;
		}
		randText = cycle
		if (showFalseText) {
			randText = Math.floor(Math.random() * quizData.length);
			// false positive case - text should be false when random instead is random but digit could be the same like cyckle
			if (cycle === randText) { showFalseText = false; }
		}
		console.log('false text? ', showFalseText, 'randText:' , randText, 'cycle: ',cycle);
		bb.question = quizData[randText].item.name
		// showNextImage()}
	}

	function startTimerQuestions () {
		clearInterval(interval);
		cycleText();
		
		bb.set_timer = true;
		interval = window.setInterval(cycleText, questionsInterval);
		
	}

	function initVisibleImage() {
		quizDataCorrect = []
		quizDataWrong = []
	}

	function start() {
		document.getElementById('run').classList.remove('js--hidden_btn_run');
		document.getElementById('run').addEventListener('click', () => {
			console.log('start pressed')
			cycle = -1; correct = 0; wrong = 0;showFalseText = false;
			bb.reset = true;
			prgs.show = false;
			showDesc = !showDesc
			document.body.classList.remove('bg-correct')
			quizData = shuffle(allTheFish.itemListElement.slice());
			document.addEventListener('keyup', pressedEvent);
			
			initVisibleImage()
			startTimerQuestions()

		})

	}

	onMount(async () => {
		console.log('fetch localdata:')
		// fetch('/assets/jsonld/1-Cotingidae_stubs.json')
		// fetch('/assets/jsonld/2-Passeri_stubs.json')
		// fetch('/assets/jsonld/17-stopnie-w-policji.json')
		// fetch('/assets/jsonld/38-Pszczołowate.json')
		fetch('/assets/jsonld/20-Fish_of_Australia.json')
		// fetch('/assets/jsonld/18-Parrot_stubs.json')
		// fetch('/assets/jsonld/6-Mięśnie_człowieka.json')
		// fetch('/assets/jsonld/303-Nato_Army_officers.json')
		// fetch('/assets/jsonld/56-Muscles_of_the_upper_limb.json')
		// fetch('/assets/jsonld/142-Food_and_drink_paintings.json')
				.then(r => r.json())
				.then(data => {
					allTheFish = data;
					initVisibleImage()
					quizData = shuffle(data.itemListElement.slice());
				})


		document.addEventListener('DOMContentLoaded', start);

	})
</script>
	<Bar bind:this={bb}/>

	<div class="answer correct-true">
		{#each quizDataCorrect as row} 
		<figure class="">
			<img loading="lazy" class="thumb" src="{ row.item.image.thumbnail.contentUrl }" data-thumb-correct="{ row.item.name }" alt="{ row.item.name }">
			<a class="wiki" rel="noreferrer nofollow" target="_blank" href="{ row.item.url }">W</a>
			<figcaption data-correct-search class="desc">{ row.item.name }</figcaption>
		</figure>
		{/each}
	</div>
	<div class="answer wrong-false">
		{#each quizDataWrong as row} 
		<figure class="">
			<img loading="lazy" class="thumb" src="{ row.item.image.thumbnail.contentUrl }" data-thumb-wrong="{ row.item.name }" alt="{ row.item.name }">
			<a class="wiki" rel="noreferrer nofollow" target="_blank" href="{ row.item.url }">W</a>
			<figcaption data-wrong-search class="desc">{ row.item.name }</figcaption>
		</figure>
		{/each}
	</div>
	<div class="main">
		{#each quizData as row, index}
		<div class="binary { index !== cycle ? 'js--hiden-binary' : 'show'}">
			<figure class="center {current === 'correct' ? 'js--correct' : ''}">
				<img loading="lazy" class="" src="{ row.item.image.contentUrl }" data-answer="{ row.item.name }" alt="{ row.item.name }">
				<figcaption data-search class="center-desc desc { showDesc ? 'js--hiden-binary' : 'show'}">{ row.item.name }</figcaption>
			</figure>
		</div>
		{/each}
	</div>
	<div class='btn-keys'>
		<button on:click={pressedEvent} id="btnTrue" class="btn-logic btn-true">TRUE</button>
		<button on:click={pressedEvent} id="btnFalse" class="btn-logic btn-false">FALSE</button>
	</div>
<Progress bind:this={prgs}/>
<style>
	.main {
		height: 60vh;
	}
	.answer figure {
		margin:0
	}
	figure.center img {
		display: block;
		margin:0 auto;
		max-width: 40vw;
		max-height: 60vh;
	}
	:global(figure.correct) {  display:none; }
	figcaption {
		display: table-caption;
    	caption-side: bottom;
	}
	.wiki {
		position:absolute;
		right: 3px;
		top: 3px;
		color: transparent;
		text-decoration: none;
		padding: 3px;
	}
	.wiki:hover {
		background-color:white;
		color:black;
	}
	img:hover {opacity:0.5;background-color:white; }

	:global(.desc.js--hidden-answer) {
		visibility:hidden;
	}
	:global(.js--correct, .js--hidden_answer) { display:none; }
	.desc {
		font-size: 14px;
		display: block;
		text-align: center;
		position: relative;
		
	}
	.center-desc.desc {background:none;}
	.js--hiden-binary {visibility:hidden;}
	.binary.js--hiden-binary { 
		margin:auto;opacity: 0.3;		
		transition: opacity ease-in-out 2.5s;
		}
	.binary {
		margin-left: auto;
		margin-right: auto;
		left: 0;
		right: 0;
		text-align: center;
		position:absolute;
		opacity: 1;
		transition: opacity ease-in-out 2.5s;
	}
	.answer {
		position: absolute;
		width: 7vw;
		z-index: 1;
	}
	.thumb {max-width: 7vw;opacity: 0.8;}
	.correct-true {left:10px; filter: grayscale(100%) brightness(40%) sepia(100%) hue-rotate(60deg) saturate(600%) contrast(0.8);}
	.wrong-false {right:10px; filter: grayscale(100%) brightness(40%) sepia(100%) hue-rotate(-60deg) saturate(600%) contrast(0.8);}
	.wrong-false:hover, .correct-true:hover {filter:none;}
	.btn-keys {display: flex;}
	.btn-logic{
		display:block;width:30vw;height:12vh;margin: 0 auto;
		color:white; font-size:2em;
		border-radius: 8px;
	}
	.btn-true { background: rgb(2,0,36);
		background: radial-gradient(circle, rgba(2,0,36,1) 0%, rgba(118,176,114,1) 0%, rgba(0,123,26,1) 80%);  }
	.btn-false {  background: rgb(2,0,36);
		background: radial-gradient(circle, rgba(2,0,36,1) 0%, rgba(150,100,100,1) 0%, rgba(163,8,8,1) 80%);  }
	:global(.btn-keys button.btn-logic.btn-pressed) { background: rgb(2,0,36);
		background: radial-gradient(circle, rgba(2,0,36,1) 0%, rgba(154,154,156,1) 0%, rgba(230,234,255,1) 80%); 
		color:rgb(39, 39, 39);
	}
</style>