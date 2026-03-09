import { gsap } from 'gsap';
import { useEffect, useRef, useCallback, memo } from 'react';

const TravelTechRobot = memo(() => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pupilsRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Respiração do corpo inteiro
      gsap.to('#robot-group', {
        scale: 1.02,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        transformOrigin: '250px 280px',
      });

      // Flutuação vertical
      gsap.to('#robot-group', {
        y: -8,
        duration: 5,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      // Braço direito apontando
      gsap.to('#arm-right', {
        rotation: -8,
        transformOrigin: '190px 225px',
        duration: 6,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      // Braço esquerdo oscilando
      gsap.to('#arm-left', {
        rotation: 5,
        transformOrigin: '310px 225px',
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      // Cabeça olhando
      gsap.to('#head-group', {
        rotation: 3,
        transformOrigin: '250px 180px',
        duration: 7,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      // Olhos color shift entre verde e ciano
      gsap.to('.eye-iris', {
        attr: { fill: '#00FFAA' },
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      // Pulsação do núcleo do peito
      gsap.to('#chest-core', {
        attr: { r: 18 },
        opacity: 0.7,
        duration: 1.5,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      // Antena piscando
      gsap.to('#antenna-tip', {
        opacity: 0.3,
        duration: 0.8,
        yoyo: true,
        repeat: -1,
        ease: 'power2.inOut',
      });

      // Juntas pulsando com stagger
      gsap.to('.joint', {
        attr: { r: 7 },
        opacity: 0.5,
        duration: 1.2,
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.3, from: 'random' },
        ease: 'sine.inOut',
      });

      // Barras analytics crescendo/decrescendo individualmente
      gsap.to('#bar-1', { scaleY: 0.35, transformOrigin: '0 100%', duration: 2.1, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      gsap.to('#bar-2', { scaleY: 0.9, transformOrigin: '0 100%', duration: 2.5, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 0.4 });
      gsap.to('#bar-3', { scaleY: 0.5, transformOrigin: '0 100%', duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 0.8 });
      gsap.to('#bar-4', { scaleY: 0.75, transformOrigin: '0 100%', duration: 2.3, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.2 });
      gsap.to('#bar-5', { scaleY: 0.45, transformOrigin: '0 100%', duration: 1.9, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.6 });

      // Trend line desenhando
      gsap.fromTo(
        '#trend-line',
        { strokeDashoffset: 220 },
        { strokeDashoffset: 0, duration: 4, repeat: -1, ease: 'none' }
      );

      // Neural synapses pulsando
      gsap.to('.synapse', {
        opacity: 0.2,
        strokeWidth: 0.5,
        duration: 0.7,
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.18, from: 'random', repeat: -1 },
        ease: 'sine.inOut',
      });

      // Nós neurais pulsando
      gsap.to('.neural-node', {
        attr: { r: 6 },
        opacity: 0.6,
        duration: 1,
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.2, from: 'random', repeat: -1 },
      });

      // KPI arc pulsando
      gsap.to('#kpi-arc', {
        strokeWidth: 4,
        opacity: 0.7,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      // Bokeh flutuando
      gsap.to('.bokeh', {
        y: -15,
        duration: 7,
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.8, from: 'random' },
        ease: 'sine.inOut',
      });

      // Scan line descendo
      gsap.to('#scan-line', {
        y: 500,
        duration: 7,
        repeat: -1,
        ease: 'none',
      });

      // Partículas subindo e sumindo
      gsap.to('.data-particle', {
        y: -60,
        opacity: 0,
        duration: 3.5,
        repeat: -1,
        stagger: { each: 0.5, from: 'random', repeat: -1 },
        ease: 'power1.out',
      });

      // Conexões das linhas piscando
      gsap.to('.connection-line', {
        strokeDashoffset: -40,
        duration: 2,
        repeat: -1,
        ease: 'none',
        stagger: 0.3,
      });

      // Pulse ring no peito
      gsap.to('#chest-ring', {
        attr: { r: 36 },
        opacity: 0,
        duration: 2,
        repeat: -1,
        ease: 'power1.out',
      });

    }, svgRef);

    return () => ctx.revert();
  }, []);

  // Mouse tracking para pupilas
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || !pupilsRef.current) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 7;
    gsap.to(Array.from(pupilsRef.current.children), { x, y, duration: 0.35, ease: 'power2.out' });
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      <svg
        ref={svgRef}
        viewBox="0 0 500 460"
        className="w-full h-full max-w-[520px]"
        onMouseMove={handleMouseMove}
        aria-hidden="true"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2d2d2d" />
            <stop offset="50%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0d0d0d" />
          </linearGradient>
          <linearGradient id="neonGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00FF41" />
            <stop offset="100%" stopColor="#00CC33" />
          </linearGradient>
          <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF4444" />
            <stop offset="25%" stopColor="#FFFF00" />
            <stop offset="50%" stopColor="#00FF41" />
            <stop offset="75%" stopColor="#00FFFF" />
            <stop offset="100%" stopColor="#FF44FF" />
          </linearGradient>
          <linearGradient id="trendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="50%" stopColor="#4ECDC4" />
            <stop offset="100%" stopColor="#45B7D1" />
          </linearGradient>
          <linearGradient id="bodyGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1a2a1a" />
            <stop offset="50%" stopColor="#222222" />
            <stop offset="100%" stopColor="#1a1a2a" />
          </linearGradient>
          <radialGradient id="eyeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00FF41" stopOpacity="1" />
            <stop offset="60%" stopColor="#00CC33" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#003311" stopOpacity="0.3" />
          </radialGradient>
          <radialGradient id="chestGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00FF41" />
            <stop offset="70%" stopColor="#00AA22" />
            <stop offset="100%" stopColor="#003311" />
          </radialGradient>

          {/* Filters */}
          <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="strongGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id="softBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="screenFilter" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── Fundo Bokeh Cyber ── */}
        <rect width="500" height="460" fill="#050b05" />
        <circle className="bokeh" cx="55"  cy="100" r="28" fill="#FF44FF" opacity="0.18" filter="url(#blur)" />
        <circle className="bokeh" cx="445" cy="90"  r="24" fill="#00FFFF" opacity="0.14" filter="url(#blur)" />
        <circle className="bokeh" cx="80"  cy="360" r="32" fill="#FFFF00" opacity="0.10" filter="url(#blur)" />
        <circle className="bokeh" cx="420" cy="370" r="26" fill="#00FF41" opacity="0.16" filter="url(#blur)" />
        <circle className="bokeh" cx="250" cy="30"  r="38" fill="#FF6B6B" opacity="0.10" filter="url(#blur)" />
        <circle className="bokeh" cx="90"  cy="230" r="20" fill="#4ECDC4" opacity="0.13" filter="url(#blur)" />
        <circle className="bokeh" cx="410" cy="240" r="30" fill="#FF44FF" opacity="0.11" filter="url(#blur)" />
        <circle className="bokeh" cx="180" cy="430" r="22" fill="#00FFFF" opacity="0.09" filter="url(#blur)" />
        <circle className="bokeh" cx="320" cy="420" r="18" fill="#FF44FF" opacity="0.09" filter="url(#blur)" />

        {/* Grid de fundo sutil */}
        <g opacity="0.04">
          {[0,1,2,3,4,5,6,7,8,9,10].map(i => (
            <line key={`v${i}`} x1={i*50} y1="0" x2={i*50} y2="460" stroke="#00FF41" strokeWidth="0.5" />
          ))}
          {[0,1,2,3,4,5,6,7,8,9].map(i => (
            <line key={`h${i}`} x1="0" y1={i*50} x2="500" y2={i*50} stroke="#00FF41" strokeWidth="0.5" />
          ))}
        </g>

        {/* Scan line */}
        <rect id="scan-line" x="0" y="-30" width="500" height="3" fill="url(#rainbowGrad)" opacity="0.12" />

        {/* Robot Group */}
        <g id="robot-group">

          {/* ── Telas Holográficas ── */}

          {/* Tela AI Neural — superior esquerda */}
          <g filter="url(#screenFilter)">
            <rect x="22" y="70" width="100" height="80" rx="6" fill="#050f05" stroke="#FF44FF" strokeWidth="1.2" opacity="0.92" />
            <text x="72" y="86" fill="#FF44FF" fontSize="8" textAnchor="middle" fontFamily="monospace" letterSpacing="1">AI NEURAL</text>
            <line x1="22" y1="90" x2="122" y2="90" stroke="#FF44FF" strokeWidth="0.5" opacity="0.5" />
            {/* Nós neurais */}
            <circle className="neural-node" cx="50"  cy="115" r="5" fill="#00FF41" opacity="0.9" />
            <circle className="neural-node" cx="72"  cy="108" r="5" fill="#FF44FF" opacity="0.9" />
            <circle className="neural-node" cx="94"  cy="115" r="5" fill="#00FFFF" opacity="0.9" />
            <circle className="neural-node" cx="61"  cy="133" r="4" fill="#FFFF44" opacity="0.8" />
            <circle className="neural-node" cx="83"  cy="133" r="4" fill="#00FF41" opacity="0.8" />
            <circle className="neural-node" cx="72"  cy="143" r="3" fill="#FF44FF" opacity="0.7" />
            {/* Sinapses */}
            <line className="synapse" x1="50"  y1="115" x2="72"  y2="108" stroke="#00FF41"  strokeWidth="1" opacity="0.9" />
            <line className="synapse" x1="72"  y1="108" x2="94"  y2="115" stroke="#FF44FF"  strokeWidth="1" opacity="0.9" />
            <line className="synapse" x1="72"  y1="108" x2="61"  y2="133" stroke="#00FFFF"  strokeWidth="1" opacity="0.8" />
            <line className="synapse" x1="72"  y1="108" x2="83"  y2="133" stroke="#FFFF44"  strokeWidth="1" opacity="0.8" />
            <line className="synapse" x1="61"  y1="133" x2="72"  y2="143" stroke="#00FF41"  strokeWidth="1" opacity="0.7" />
            <line className="synapse" x1="83"  y1="133" x2="72"  y2="143" stroke="#FF44FF"  strokeWidth="1" opacity="0.7" />
            <line className="synapse" x1="50"  y1="115" x2="61"  y2="133" stroke="#00FFFF"  strokeWidth="0.8" opacity="0.6" />
            <line className="synapse" x1="94"  y1="115" x2="83"  y2="133" stroke="#FFFF44"  strokeWidth="0.8" opacity="0.6" />
          </g>

          {/* Tela Analytics — superior direita */}
          <g filter="url(#screenFilter)">
            <rect x="378" y="70" width="100" height="80" rx="6" fill="#050f0f" stroke="#00FFFF" strokeWidth="1.2" opacity="0.92" />
            <text x="428" y="86" fill="#00FFFF" fontSize="8" textAnchor="middle" fontFamily="monospace" letterSpacing="1">ANALYTICS</text>
            <line x1="378" y1="90" x2="478" y2="90" stroke="#00FFFF" strokeWidth="0.5" opacity="0.5" />
            {/* Barras */}
            <rect id="bar-1" x="392" y="118" width="11" height="26" rx="2" fill="#FF6B6B" />
            <rect id="bar-2" x="407" y="110" width="11" height="34" rx="2" fill="#00FFFF" />
            <rect id="bar-3" x="422" y="114" width="11" height="30" rx="2" fill="#4ECDC4" />
            <rect id="bar-4" x="437" y="108" width="11" height="36" rx="2" fill="#45B7D1" />
            <rect id="bar-5" x="452" y="116" width="11" height="28" rx="2" fill="#FF44FF" />
          </g>

          {/* Tela KPI Satisfação — esquerda meio */}
          <g filter="url(#screenFilter)">
            <rect x="18" y="180" width="100" height="70" rx="6" fill="#0a080a" stroke="url(#rainbowGrad)" strokeWidth="1.5" opacity="0.92" />
            <text x="68" y="197" fill="#fff" fontSize="7.5" textAnchor="middle" fontFamily="monospace" letterSpacing="0.5">SATISFAÇÃO</text>
            <text x="68" y="232" fill="url(#rainbowGrad)" fontSize="20" textAnchor="middle" fontWeight="bold" fontFamily="monospace">98.5%</text>
            <path id="kpi-arc" d="M 30 240 Q 68 220 106 240" fill="none" stroke="url(#rainbowGrad)" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* Tela Trend — direita meio */}
          <g filter="url(#screenFilter)">
            <rect x="382" y="180" width="100" height="70" rx="6" fill="#050a0f" stroke="url(#trendGrad)" strokeWidth="1.2" opacity="0.92" />
            <text x="432" y="197" fill="#4ECDC4" fontSize="7.5" textAnchor="middle" fontFamily="monospace" letterSpacing="1">TREND</text>
            <line x1="382" y1="200" x2="482" y2="200" stroke="#4ECDC4" strokeWidth="0.5" opacity="0.4" />
            {/* Linha ascendente */}
            <path
              id="trend-line"
              d="M 395 238 L 408 228 L 420 232 L 433 218 L 445 210 L 458 202 L 468 195"
              fill="none"
              stroke="url(#trendGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="220"
            />
            <circle cx="468" cy="195" r="3.5" fill="#45B7D1" filter="url(#glow)" />
          </g>

          {/* ── Braço Esquerdo (lado esquerdo do robô = direita da tela) ── */}
          <g id="arm-left">
            {/* Ombro */}
            <ellipse cx="200" cy="250" rx="14" ry="12" fill="url(#bodyGrad)" stroke="#00FF41" strokeWidth="1.5" />
            <circle className="joint" cx="200" cy="250" r="6" fill="url(#neonGreenGrad)" filter="url(#glow)" />
            {/* Braço superior */}
            <rect x="148" y="242" width="55" height="18" rx="9" fill="url(#bodyGrad)" stroke="#00FF41" strokeWidth="1.2" />
            {/* Cotovelo */}
            <circle className="joint" cx="155" cy="251" r="7" fill="url(#neonGreenGrad)" filter="url(#glow)" />
            {/* Antebraço flexionado */}
            <rect x="110" y="258" width="50" height="15" rx="7.5" fill="url(#bodyGrad)" stroke="#00FF41" strokeWidth="1.2" transform="rotate(-35 135 266)" />
            {/* Pulso */}
            <circle className="joint" cx="113" cy="280" r="8" fill="url(#bodyGrad)" stroke="#00FF41" strokeWidth="1.5" />
            <circle className="joint" cx="113" cy="280" r="4" fill="url(#neonGreenGrad)" filter="url(#glow)" />
            {/* Mão */}
            <ellipse cx="100" cy="295" rx="14" ry="11" fill="url(#bodyGrad)" stroke="#00FF41" strokeWidth="1.2" />
          </g>

          {/* ── Braço Direito (apontando) ── */}
          <g id="arm-right">
            {/* Ombro */}
            <ellipse cx="300" cy="250" rx="14" ry="12" fill="url(#bodyGrad)" stroke="#00FF41" strokeWidth="1.5" />
            <circle className="joint" cx="300" cy="250" r="6" fill="url(#neonGreenGrad)" filter="url(#glow)" />
            {/* Braço superior inclinado para cima */}
            <rect x="296" y="205" width="18" height="50" rx="9" fill="url(#bodyGrad)" stroke="#00FF41" strokeWidth="1.2" transform="rotate(15 305 230)" />
            {/* Cotovelo */}
            <circle className="joint" cx="328" cy="215" r="7" fill="url(#neonGreenGrad)" filter="url(#glow)" />
            {/* Antebraço */}
            <rect x="323" y="155" width="15" height="65" rx="7.5" fill="url(#bodyGrad)" stroke="#00FF41" strokeWidth="1.2" transform="rotate(20 330 185)" />
            {/* Pulso */}
            <circle className="joint" cx="360" cy="148" r="8" fill="url(#bodyGrad)" stroke="#00FF41" strokeWidth="1.5" />
            <circle className="joint" cx="360" cy="148" r="4" fill="url(#neonGreenGrad)" filter="url(#glow)" />
            {/* Mão */}
            <ellipse cx="372" cy="135" rx="13" ry="11" fill="url(#bodyGrad)" stroke="#00FF41" strokeWidth="1.2" transform="rotate(25 372 135)" />
            {/* Dedo indicador apontando */}
            <rect x="378" y="100" width="9" height="30" rx="4.5" fill="url(#bodyGrad)" stroke="#00FF41" strokeWidth="1.2" transform="rotate(15 382 115)" />
            <circle cx="382" cy="97" r="5.5" fill="url(#neonGreenGrad)" filter="url(#strongGlow)" />
          </g>

          {/* ── Corpo/Torso ── */}
          <g id="torso">
            <rect x="188" y="215" width="124" height="140" rx="22" fill="url(#bodyGrad2)" stroke="#00FF41" strokeWidth="2" />

            {/* Detalhes laterais */}
            <rect x="200" y="232" width="3" height="50" rx="1.5" fill="#00FF41" opacity="0.4" />
            <rect x="297" y="232" width="3" height="50" rx="1.5" fill="#00FF41" opacity="0.4" />

            {/* Linhas horizontais decorativas */}
            <line x1="200" y1="230" x2="300" y2="230" stroke="#00FF41" strokeWidth="0.8" opacity="0.4" />
            <line x1="200" y1="340" x2="300" y2="340" stroke="#00FF41" strokeWidth="0.8" opacity="0.4" />

            {/* Peito — ring de pulso externo */}
            <circle id="chest-ring" cx="250" cy="285" r="30" fill="none" stroke="#00FF41" strokeWidth="2" opacity="0.5" />

            {/* Peito — aro */}
            <circle cx="250" cy="285" r="28" fill="#0d0d0d" stroke="#00FF41" strokeWidth="2" />

            {/* Peito — núcleo */}
            <circle id="chest-core" cx="250" cy="285" r="15" fill="url(#chestGrad)" filter="url(#strongGlow)" />

            {/* Arcos de energia */}
            <path d="M 225 285 Q 250 268 275 285" fill="none" stroke="#00FFFF" strokeWidth="1.8" opacity="0.7" filter="url(#glow)" strokeLinecap="round" />
            <path d="M 225 285 Q 250 302 275 285" fill="none" stroke="#00FFFF" strokeWidth="1.8" opacity="0.7" filter="url(#glow)" strokeLinecap="round" />
          </g>

          {/* ── Cabeça ── */}
          <g id="head-group">
            {/* Pescoço */}
            <rect x="232" y="195" width="36" height="28" rx="8" fill="url(#bodyGrad)" stroke="#00FF41" strokeWidth="1.2" />
            <line x1="244" y1="195" x2="244" y2="223" stroke="#00FF41" strokeWidth="0.8" opacity="0.3" />
            <line x1="256" y1="195" x2="256" y2="223" stroke="#00FF41" strokeWidth="0.8" opacity="0.3" />

            {/* Cabeça */}
            <ellipse cx="250" cy="140" rx="60" ry="58" fill="url(#bodyGrad2)" stroke="#00FF41" strokeWidth="2.2" />

            {/* Faixa lateral esquerda */}
            <rect x="192" y="120" width="6" height="40" rx="3" fill="#00FF41" opacity="0.5" />
            {/* Faixa lateral direita */}
            <rect x="302" y="120" width="6" height="40" rx="3" fill="#00FF41" opacity="0.5" />

            {/* Testa / visor */}
            <rect x="215" y="98" width="70" height="10" rx="5" fill="#00FF41" opacity="0.25" />

            {/* Antena */}
            <rect x="247" y="72" width="6" height="22" rx="3" fill="url(#bodyGrad)" stroke="#00FF41" strokeWidth="1" />
            <circle id="antenna-tip" cx="250" cy="67" r="7" fill="url(#neonGreenGrad)" filter="url(#strongGlow)" />

            {/* Olho Esquerdo */}
            <ellipse cx="218" cy="140" rx="22" ry="20" fill="#0a0a0a" stroke="#00FF41" strokeWidth="2" />
            <ellipse className="eye-iris" cx="218" cy="140" rx="15" ry="13" fill="#00FF41" filter="url(#strongGlow)" />
            <ellipse cx="218" cy="140" rx="9" ry="8" fill="url(#eyeGrad)" opacity="0.8" />

            {/* Olho Direito */}
            <ellipse cx="282" cy="140" rx="22" ry="20" fill="#0a0a0a" stroke="#00FF41" strokeWidth="2" />
            <ellipse className="eye-iris" cx="282" cy="140" rx="15" ry="13" fill="#00FF41" filter="url(#strongGlow)" />
            <ellipse cx="282" cy="140" rx="9" ry="8" fill="url(#eyeGrad)" opacity="0.8" />

            {/* Pupilas — seguem mouse */}
            <g ref={pupilsRef}>
              <circle cx="218" cy="140" r="5" fill="#001a00" />
              <circle cx="282" cy="140" r="5" fill="#001a00" />
            </g>

            {/* Brilho dos olhos */}
            <circle cx="212" cy="134" r="2.5" fill="white" opacity="0.6" />
            <circle cx="276" cy="134" r="2.5" fill="white" opacity="0.6" />

            {/* Boca / speaker */}
            <rect x="227" y="170" width="46" height="10" rx="5" fill="#0a0a0a" stroke="#00FF41" strokeWidth="1" />
            <rect x="233" y="173" width="6" height="4" rx="2" fill="#00FF41" opacity="0.6" />
            <rect x="243" y="173" width="6" height="4" rx="2" fill="#00FF41" opacity="0.8" />
            <rect x="253" y="173" width="6" height="4" rx="2" fill="#00FF41" opacity="0.6" />
            <rect x="263" y="173" width="6" height="4" rx="2" fill="#00FF41" opacity="0.4" />
          </g>

          {/* ── Base / Pernas ── */}
          <g id="base">
            {/* Junção quadril */}
            <rect x="205" y="345" width="90" height="22" rx="11" fill="url(#bodyGrad)" stroke="#00FF41" strokeWidth="1.5" />

            {/* Perna esquerda */}
            <rect x="208" y="362" width="35" height="40" rx="8" fill="url(#bodyGrad)" stroke="#00FF41" strokeWidth="1.2" />
            <circle className="joint" cx="225" cy="400" r="7" fill="url(#neonGreenGrad)" filter="url(#glow)" />
            <rect x="212" y="400" width="26" height="20" rx="6" fill="url(#bodyGrad)" stroke="#00FF41" strokeWidth="1" />

            {/* Perna direita */}
            <rect x="257" y="362" width="35" height="40" rx="8" fill="url(#bodyGrad)" stroke="#00FF41" strokeWidth="1.2" />
            <circle className="joint" cx="274" cy="400" r="7" fill="url(#neonGreenGrad)" filter="url(#glow)" />
            <rect x="262" y="400" width="26" height="20" rx="6" fill="url(#bodyGrad)" stroke="#00FF41" strokeWidth="1" />

            {/* Sombra/glow na base */}
            <ellipse cx="250" cy="428" rx="65" ry="12" fill="#00FF41" opacity="0.15" filter="url(#softBlur)" />
          </g>
        </g>

        {/* Linhas de conexão robô → telas (animadas com dashoffset) */}
        <g opacity="0.35">
          <line className="connection-line" x1="200" y1="235" x2="122" y2="115" stroke="#FF44FF" strokeWidth="1" strokeDasharray="6 6" />
          <line className="connection-line" x1="300" y1="235" x2="378" y2="115" stroke="#00FFFF" strokeWidth="1" strokeDasharray="6 6" />
          <line className="connection-line" x1="195" y1="265" x2="118" y2="215" stroke="url(#rainbowGrad)" strokeWidth="1" strokeDasharray="6 6" />
          <line className="connection-line" x1="305" y1="265" x2="382" y2="215" stroke="url(#trendGrad)" strokeWidth="1" strokeDasharray="6 6" />
        </g>

        {/* Data particles */}
        <circle className="data-particle" cx="160" cy="310" r="2.5" fill="#00FF41" opacity="0.9" />
        <circle className="data-particle" cx="345" cy="295" r="2"   fill="#00FFFF" opacity="0.8" />
        <circle className="data-particle" cx="210" cy="335" r="1.8" fill="#FF44FF" opacity="0.7" />
        <circle className="data-particle" cx="295" cy="320" r="2"   fill="#FFFF44" opacity="0.8" />
        <circle className="data-particle" cx="180" cy="290" r="1.5" fill="#00FF41" opacity="0.6" />
        <circle className="data-particle" cx="320" cy="305" r="1.5" fill="#FF6B6B" opacity="0.7" />
        <circle className="data-particle" cx="240" cy="345" r="2"   fill="#00FFFF" opacity="0.7" />
        <circle className="data-particle" cx="265" cy="330" r="1.5" fill="#FF44FF" opacity="0.6" />

        {/* Tela inferior — Lista textual */}
        <g filter="url(#screenFilter)">
          <rect x="160" y="438" width="180" height="18" rx="5" fill="#0a0d0a" stroke="#00FF41" strokeWidth="1" opacity="0.88" />
          <text x="175" y="451" fill="#00FF41" fontSize="7" fontFamily="monospace" opacity="0.9">▸ Turistas: 1.247k</text>
          <text x="290" y="451" fill="#00FFFF" fontSize="7" fontFamily="monospace" opacity="0.8">▸ IA: 24/7</text>
        </g>
      </svg>
    </div>
  );
});

TravelTechRobot.displayName = 'TravelTechRobot';
export default TravelTechRobot;
