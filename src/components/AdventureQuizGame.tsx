import React, { useState, useEffect, useRef, Fragment } from "react";
import { Shield, Sparkles, Heart, Compass, AlertCircle, ArrowRight, Zap, RefreshCw, X, Play } from "lucide-react";
import { QuizQuestion } from "../types";

interface AdventureQuizGameProps {
  key?: string | number;
  question: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  categoryName: string;
  onAnswerSelected: (selectedIdx: number, timeLeft: number) => void;
  onNextQuestion: () => void;
  isLastQuestion: boolean;
  timerLimit: number;
}

export default function AdventureQuizGame({
  question,
  currentIndex,
  totalQuestions,
  categoryName,
  onAnswerSelected,
  onNextQuestion,
  isLastQuestion,
  timerLimit,
}: AdventureQuizGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // States
  const [gameState, setGameState] = useState<"intro" | "countdown" | "playing" | "gatePhase" | "answered">("intro");
  const [countdown, setCountdown] = useState(3);
  const [health, setHealth] = useState(100);
  const [distance, setDistance] = useState(0); // 0 to 100%
  const [timeLeft, setTimeLeft] = useState(timerLimit);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [scoreMultiplier, setScoreMultiplier] = useState(1.0); // Penalty if health runs out
  const [screenShake, setScreenShake] = useState(false);
  const [showDirectOptions, setShowDirectOptions] = useState(false); // Fallback to click if they prefer

  // References to keep game loop variables without triggering re-renders
  const stateRef = useRef({
    gameState: "intro" as "intro" | "countdown" | "playing" | "gatePhase" | "answered",
    playerX: 300,
    playerY: 710,
    playerTargetX: 300,
    playerTargetY: 710,
    velocity: 0,
    health: 100,
    distance: 0,
    obstacles: [] as Array<{ x: number; y: number; size: number; speed: number; text: string; id: number }>,
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; size: number; color: string; alpha: number; decay: number }>,
    gates: [] as Array<{ idx: number; label: string; x: number; y: number; width: number; height: number; color: string }>,
    enemyJets: [] as Array<{ x: number; y: number; speed: number; targetX: number; shootCooldown: number }>,
    enemyBullets: [] as Array<{ x: number; y: number; vx: number; vy: number; size: number }>,
    blackHoles: [] as Array<{ x: number; y: number; size: number; speed: number; pullRadius: number; pullStrength: number; spin: number }>,
    hpItems: [] as Array<{ x: number; y: number; size: number; speed: number }>,
    keys: {} as Record<string, boolean>,
    tick: 0,
    hitFlashFrames: 0,
    selectedOptionIdx: null as number | null,
    isCorrect: false,
    timerLimit: timerLimit,
    timeLeft: timerLimit,
  });

  // Keep ref variables strictly synced with parent / react state
  useEffect(() => {
    stateRef.current.gameState = gameState;
  }, [gameState]);

  useEffect(() => {
    stateRef.current.health = health;
  }, [health]);

  useEffect(() => {
    stateRef.current.timeLeft = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    stateRef.current.distance = distance;
  }, [distance]);

  // Sync timer limits
  useEffect(() => {
    setTimeLeft(timerLimit);
    stateRef.current.timeLeft = timerLimit;
    stateRef.current.timerLimit = timerLimit;
  }, [question.id, timerLimit]);

  // Key event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key] = true;
      if (["ArrowLeft", "ArrowRight", "Space", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Countdown countdown effect
  useEffect(() => {
    if (gameState !== "countdown") return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Effect to handle transition once countdown reaches 0 safely
  useEffect(() => {
    if (gameState === "countdown" && countdown === 0) {
      setGameState("playing");
      setCountdown(3); // Reset countdown for the next question
      
      // Reset running states cleanly in commit phase
      setHealth(100);
      setDistance(0);
      stateRef.current.health = 100;
      stateRef.current.distance = 0;
      stateRef.current.playerX = 300;
      stateRef.current.playerY = 710;
      stateRef.current.playerTargetX = 300;
      stateRef.current.playerTargetY = 710;
      stateRef.current.hitFlashFrames = 0;
      stateRef.current.obstacles = [];
      stateRef.current.particles = [];
      stateRef.current.gates = [];
      stateRef.current.enemyJets = [];
      stateRef.current.enemyBullets = [];
      stateRef.current.blackHoles = [];
      stateRef.current.hpItems = [];
      stateRef.current.timeLeft = timerLimit;
      stateRef.current.selectedOptionIdx = null;
      setSelectedOptionIdx(null);
    }
  }, [countdown, gameState, timerLimit]);

  // Quiz ticking timer
  useEffect(() => {
    if (gameState !== "playing" && gameState !== "gatePhase") {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, question.id]);

  // Effect to safely handle quiz timeout when timeLeft reaches 0 cleanly
  useEffect(() => {
    if (timeLeft === 0 && (gameState === "playing" || gameState === "gatePhase")) {
      handleTriggerTimeout();
    }
  }, [timeLeft, gameState]);

  const handleTriggerTimeout = () => {
    // Force direct answer with 0 remaining time
    setGameState("answered");
    setSelectedOptionIdx(-1); // Timeout
    stateRef.current.gameState = "answered";
    onAnswerSelected(-1, 0);
  };

  const startQuizAdventure = () => {
    setCountdown(3);
    setGameState("countdown");
  };

  // Main high performance canvas loop
  useEffect(() => {
    if (gameState !== "playing" && gameState !== "gatePhase" && gameState !== "answered") {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let obstacleIdCounter = 0;

    // Obstacle dictionary of distraction words for Malaysian student context
    const distractionTexts = ["RAGU ☄️", "LEKA", "MALAS ☄️", "LALAI", "WAS-WAS", "IGRA", "DUNIAWI"];

    // Initialize option gates at 100% distance
    const initializeOptionGates = () => {
      const gateWidth = 125;
      const spacing = (canvas.width - gateWidth * 4) / 5;
      
      const colors = ["#10b981", "#06b6d4", "#3b82f6", "#a855f7"]; // Emerald, Cyan, Blue, Purple
      stateRef.current.gates = question.options.map((opt, i) => {
        const xCoord = spacing + i * (gateWidth + spacing);
        return {
          idx: i,
          label: String.fromCharCode(65 + i), // A, B, C, D
          x: xCoord,
          y: -120, // Start higher up
          width: gateWidth,
          height: 60,
          color: colors[i] || "#20b2aa",
        };
      });
    };

    const updateAndDraw = () => {
      const gState = stateRef.current.gameState;
      stateRef.current.tick++;

      // Canvas dimensions
      const cw = canvas.width;
      const ch = canvas.height;

      // Clear Frame
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, cw, ch);

      // Draw Starfield Background
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      for (let s = 0; s < 40; s++) {
        const starX = (Math.sin(s + stateRef.current.tick * 0.005) * 0.5 + 0.5) * cw;
        const starY = ((s * 15 + stateRef.current.tick * (gState === "playing" ? 2 : 0.4)) % ch);
        ctx.beginPath();
        ctx.arc(starX, starY, s % 3 === 0 ? 1.5 : 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Cosmic Dust/Fey sparks
      if (stateRef.current.tick % 5 === 0 && gState === "playing") {
        stateRef.current.particles.push({
          x: Math.random() * cw,
          y: 0,
          vx: 0,
          vy: Math.random() * 2 + 1,
          size: Math.random() * 2,
          color: "rgba(14, 165, 233, 0.2)",
          alpha: 0.8,
          decay: 0.005,
        });
      }

      // 1. Move Player Character
      let targetX = stateRef.current.playerX;
      let targetY = stateRef.current.playerY;

      // Handle Keyboard Controls
      const speed = 6;
      if (stateRef.current.keys["ArrowLeft"] || stateRef.current.keys["a"] || stateRef.current.keys["A"]) {
        targetX -= speed;
      }
      if (stateRef.current.keys["ArrowRight"] || stateRef.current.keys["d"] || stateRef.current.keys["D"]) {
        targetX += speed;
      }
      if (stateRef.current.keys["ArrowUp"] || stateRef.current.keys["w"] || stateRef.current.keys["W"]) {
        targetY -= speed;
      }
      if (stateRef.current.keys["ArrowDown"] || stateRef.current.keys["s"] || stateRef.current.keys["S"]) {
        targetY += speed;
      }

      // Keep inside bounds
      targetX = Math.max(25, Math.min(cw - 25, targetX));
      targetY = Math.max(30, Math.min(ch - 30, targetY));

      // Drag / Mouse tracking update
      const dragFactor = 0.15; // Smooth interpolation
      stateRef.current.playerX += (stateRef.current.playerTargetX - stateRef.current.playerX) * dragFactor;
      stateRef.current.playerY += (stateRef.current.playerTargetY - stateRef.current.playerY) * dragFactor;

      // If they are styling keys, add keyboard velocity
      if (targetX !== stateRef.current.playerX || targetY !== stateRef.current.playerY) {
        stateRef.current.playerX += (targetX - stateRef.current.playerX) * 0.4;
        stateRef.current.playerY += (targetY - stateRef.current.playerY) * 0.4;
        stateRef.current.playerTargetX = stateRef.current.playerX;
        stateRef.current.playerTargetY = stateRef.current.playerY;
      }

      // Emit small spark trails behind player
      if (stateRef.current.tick % 2 === 0 && gState !== "answered") {
        stateRef.current.particles.push({
          x: stateRef.current.playerX + (Math.random() * 10 - 5),
          y: stateRef.current.playerY + 20,
          vx: Math.random() * 2 - 1,
          vy: Math.random() * 2 + 1,
          size: Math.random() * 3 + 1,
          color: "rgba(20, 184, 166, 0.75)", // Teal glow
          alpha: 1,
          decay: 0.02,
        });
      }

      // 2. Spawn and Handle Obstacles, Enemy pilots, Black holes and HP capsules in "playing" phase
      if (gState === "playing") {
        // Increase distance progress slowly - exactly 15 seconds to reach 100% at 60fps (distStep = 100 / (15 * 60) ≈ 0.1111)
        const distStep = 100 / (15 * 60);
        stateRef.current.distance = Math.min(100, stateRef.current.distance + distStep);
        setDistance(Math.round(stateRef.current.distance));

        // When reach 100%, trigger gate phase
        if (stateRef.current.distance >= 100) {
          stateRef.current.gameState = "gatePhase";
          setGameState("gatePhase");
          initializeOptionGates();
        }

        // --- ENEMY JET SPAWNING ---
        // Spawn one helper enemy/distractor jet if none exists and distance is below 90%
        if (stateRef.current.enemyJets.length === 0 && stateRef.current.distance < 90) {
          stateRef.current.enemyJets.push({
            x: cw / 2,
            y: 45,
            speed: 2,
            targetX: cw / 2,
            shootCooldown: 40
          });
        }

        // --- BLACK HOLE SPAWNING ---
        // Spawn deep space gravity-pull anomalies (every ~4 seconds)
        if (stateRef.current.tick % 240 === 0 && stateRef.current.distance < 88) {
          stateRef.current.blackHoles.push({
            x: Math.random() * (cw - 120) + 60,
            y: -44,
            size: Math.random() * 16 + 28, // core bounding circle size
            speed: 1.0,
            pullRadius: 110,
            pullStrength: 1.8,
            spin: Math.random() * Math.PI
          });
        }

        // --- FLOATING HP RECOVERY SPAWNING ---
        // Periodically spawn floating green core packages to recover health
        if (stateRef.current.tick % 260 === 0 && stateRef.current.distance < 88) {
          stateRef.current.hpItems.push({
            x: Math.random() * (cw - 80) + 40,
            y: -30,
            size: 15,
            speed: 1.5
          });
        }

        // Spawn standard distraction obstacle meteors
        const spawnInterval = 32; // Frequency of obstacle spawn
        if (stateRef.current.tick % spawnInterval === 0 && stateRef.current.distance < 92) {
          obstacleIdCounter++;
          const textVal = distractionTexts[Math.floor(Math.random() * distractionTexts.length)] || "DOUBT";
          stateRef.current.obstacles.push({
            id: obstacleIdCounter,
            x: Math.random() * (cw - 80) + 40,
            y: -30,
            size: Math.random() * 15 + 16,
            speed: Math.random() * 2.2 + 2.5,
            text: textVal,
          });
        }
      }

      // Update and Draw Obstacles
      for (let i = stateRef.current.obstacles.length - 1; i >= 0; i--) {
        const obs = stateRef.current.obstacles[i];
        if (!obs) continue;

        obs.y += obs.speed; // Fall down

        // Draw glowing obstacle
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(225, 29, 72, 0.6)"; // Neon red glow for obstacles
        ctx.fillStyle = "#ff4d6d";
        
        ctx.beginPath();
        // Polygon shape for obstacle
        ctx.moveTo(obs.x, obs.y - obs.size / 2);
        ctx.lineTo(obs.x + obs.size / 2, obs.y - obs.size / 6);
        ctx.lineTo(obs.x + obs.size / 3, obs.y + obs.size / 2);
        ctx.lineTo(obs.x - obs.size / 3, obs.y + obs.size / 2);
        ctx.lineTo(obs.x - obs.size / 2, obs.y - obs.size / 6);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Check crash collision with player
        const distToPlayer = Math.hypot(obs.x - stateRef.current.playerX, obs.y - stateRef.current.playerY);
        if (distToPlayer < obs.size / 2 + 15) {
          // Collision detected!
          stateRef.current.hitFlashFrames = 18;

          // Spawn high-density explosion burst
          for (let p = 0; p < 15; p++) {
            stateRef.current.particles.push({
              x: obs.x,
              y: obs.y,
              vx: Math.random() * 6 - 3,
              vy: Math.random() * 6 - 3,
              size: Math.random() * 4 + 1.5,
              color: "#f43f5e",
              alpha: 1,
              decay: 0.03,
            });
          }

          // Lose health
          const currentHP = Math.max(0, stateRef.current.health - 25);
          stateRef.current.health = currentHP;
          setHealth(currentHP);

          // If health runs out, trigger shield malfunction multiplier
          if (currentHP <= 0) {
            setScoreMultiplier(0.5); // Warn/penalize score multiplier slightly
          }

          // Remove obstacle
          stateRef.current.obstacles.splice(i, 1);
          continue;
        }

        // Clean off-screen obstacles
        if (obs.y > ch + 40) {
          stateRef.current.obstacles.splice(i, 1);
        }
      }

      // -- Update & Draw Enemy Jets --
      for (let j = stateRef.current.enemyJets.length - 1; j >= 0; j--) {
        const jet = stateRef.current.enemyJets[j];
        if (!jet) continue;

        // Slide/glide back and forth horizontally near the top area
        if (stateRef.current.tick % 50 === 0) {
          jet.targetX = Math.random() * (cw - 120) + 60;
        }
        jet.x += (jet.targetX - jet.x) * 0.04;

        // Draw elegant glowing fighter jet (was-was enemy/distractor)
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#ec4899"; // pink glowing jet
        ctx.fillStyle = "#ec4899";
        
        ctx.beginPath();
        ctx.moveTo(jet.x, jet.y + 15); // Nose
        ctx.lineTo(jet.x - 22, jet.y - 12); // Left wing back
        ctx.lineTo(jet.x - 6, jet.y - 4); // Left fuselage
        ctx.lineTo(jet.x, jet.y - 18); // Tail/exhaust tip
        ctx.lineTo(jet.x + 6, jet.y - 4); // Right fuselage
        ctx.lineTo(jet.x + 22, jet.y - 12); // Right wing back
        ctx.closePath();
        ctx.fill();

        // Glowing jet thruster flame
        ctx.fillStyle = "#fb5607";
        ctx.beginPath();
        ctx.moveTo(jet.x - 4, jet.y - 12);
        ctx.lineTo(jet.x, jet.y - 25 - (Math.random() * 8));
        ctx.lineTo(jet.x + 4, jet.y - 12);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;

        // Shooting mechanism towards student ship
        if (gState === "playing") {
          jet.shootCooldown--;
          if (jet.shootCooldown <= 0) {
            // Shoots down aiming slightly in direction of player X
            const dx = stateRef.current.playerX - jet.x;
            const dy = stateRef.current.playerY - jet.y;
            const dist = Math.hypot(dx, dy) || 1;
            
            stateRef.current.enemyBullets.push({
              x: jet.x,
              y: jet.y + 15,
              vx: (dx / dist) * 1.5, // gentle tracking/aiming vector
              vy: 3.8, // downward velocity
              size: 4.5
            });
            jet.shootCooldown = 55 + Math.random() * 30; // fire every 1-1.5 seconds
          }
        }

        // Remove if we are in gatePhase or answered (fade away/retreat)
        if (gState === "gatePhase" || gState === "answered") {
          jet.y -= 3; // fly up off-screen
          if (jet.y < -50) {
            stateRef.current.enemyJets.splice(j, 1);
          }
        }
      }

      // -- Update & Draw Enemy Bullets --
      for (let b = stateRef.current.enemyBullets.length - 1; b >= 0; b--) {
        const bullet = stateRef.current.enemyBullets[b];
        if (!bullet) continue;

        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        // Draw bullet as red/pink glowing plasma sphere
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#f43f5e";
        ctx.fillStyle = "#ff1744";
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Collision detection with player ship/core
        const distToPlayer = Math.hypot(bullet.x - stateRef.current.playerX, bullet.y - stateRef.current.playerY);
        if (distToPlayer < bullet.size + 15 && gState !== "answered") {
          // Take hit!
          stateRef.current.hitFlashFrames = 18;

          // Spark collision explosion
          for (let p = 0; p < 8; p++) {
            stateRef.current.particles.push({
              x: bullet.x,
              y: bullet.y,
              vx: Math.random() * 4 - 2,
              vy: Math.random() * 4 - 2,
              size: Math.random() * 3 + 1,
              color: "#f43f5e",
              alpha: 1,
              decay: 0.04
            });
          }

          // Damage health and remove
          const currentHP = Math.max(0, stateRef.current.health - 15);
          stateRef.current.health = currentHP;
          setHealth(currentHP);
          if (currentHP <= 0) {
            setScoreMultiplier(0.5);
          }

          stateRef.current.enemyBullets.splice(b, 1);
          continue;
        }

        // Reap offscreen bullets
        if (bullet.y > ch + 20 || bullet.x < -20 || bullet.x > cw + 20) {
          stateRef.current.enemyBullets.splice(b, 1);
        }
      }

      // -- Update & Draw Black Holes (Anomali Graviti) --
      for (let h = stateRef.current.blackHoles.length - 1; h >= 0; h--) {
        const bh = stateRef.current.blackHoles[h];
        if (!bh) continue;

        bh.y += bh.speed; // drift downward
        bh.spin += 0.05;  // vortex spin

        // Draw gravitational influence radius indicator (faint dashed circle)
        ctx.strokeStyle = "rgba(168, 85, 247, 0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bh.x, bh.y, bh.pullRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw Swirling Event Horizon
        ctx.shadowBlur = 18;
        ctx.shadowColor = "#a855f7"; // purple gravitational anomaly
        ctx.fillStyle = "#02010a";    // dense light-absorbing singularities core
        ctx.beginPath();
        ctx.arc(bh.x, bh.y, bh.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Render spiraling glowing rings
        ctx.strokeStyle = "#c084fc";
        ctx.lineWidth = 2.5;
        for (let ring = 0; ring < 3; ring++) {
          ctx.beginPath();
          ctx.arc(
            bh.x,
            bh.y,
            bh.size / 2 + ring * 6,
            bh.spin + ring * (Math.PI / 1.5),
            bh.spin + ring * (Math.PI / 1.5) + Math.PI * 0.9,
            false
          );
          ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Compute gravitational attraction vectors on student player ship
        const dx = bh.x - stateRef.current.playerX;
        const dy = bh.y - stateRef.current.playerY;
        const dist = Math.hypot(dx, dy) || 1;

        if (dist < bh.pullRadius && gState !== "answered") {
          // Linear acceleration pull: stronger force as distance matches singularity center
          const pullRatio = 1 - (dist / bh.pullRadius);
          const currentForce = pullRatio * bh.pullStrength;

          // Drag student craft directly inward
          stateRef.current.playerX += (dx / dist) * currentForce;
          stateRef.current.playerY += (dy / dist) * currentForce;
          
          // Pull target pointer as well to limit steering resistance
          stateRef.current.playerTargetX += (dx / dist) * currentForce * 0.4;
          stateRef.current.playerTargetY += (dy / dist) * currentForce * 0.4;

          // Emission particles going into black hole
          if (stateRef.current.tick % 5 === 0) {
            stateRef.current.particles.push({
              x: stateRef.current.playerX + (Math.random() * 16 - 8),
              y: stateRef.current.playerY + (Math.random() * 16 - 8),
              vx: (dx / dist) * 2.2,
              vy: (dy / dist) * 2.2,
              size: 1.5,
              color: "#c084fc", // purple pull dust
              alpha: 0.9,
              decay: 0.04
            });
          }

          // Singular core crush damage!
          if (dist < bh.size / 2 + 16) {
            stateRef.current.hitFlashFrames = 8;
            const currentHP = Math.max(0, stateRef.current.health - 0.7); // siphonic tick damage
            stateRef.current.health = currentHP;
            setHealth(Math.round(currentHP));
            if (currentHP <= 0) {
              setScoreMultiplier(0.5);
            }
          }
        }

        // Reap offscreen black holes
        if (bh.y > ch + 60) {
          stateRef.current.blackHoles.splice(h, 1);
        }
      }

      // -- Update & Draw HP Recovery Items --
      for (let hIndex = stateRef.current.hpItems.length - 1; hIndex >= 0; hIndex--) {
        const item = stateRef.current.hpItems[hIndex];
        if (!item) continue;

        item.y += item.speed; // descend

        // Draw nice green floating health cross
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#10b981";
        
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        // vertical bar
        ctx.fillRect(item.x - 3.5, item.y - item.size / 2, 7, item.size);
        // horizontal bar
        ctx.fillRect(item.x - item.size / 2, item.y - 3.5, item.size, 7);
        
        // Draw white outline/sphere highlights for contrast
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(item.x - item.size/2, item.y - item.size/2, item.size, item.size);

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#34d399";
        ctx.font = "bold 8px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("HP +30 💚", item.x, item.y + item.size/2 + 9);

        // Collision with player ship
        const distToPlayer = Math.hypot(item.x - stateRef.current.playerX, item.y - stateRef.current.playerY);
        if (distToPlayer < 24 && gState !== "answered") {
          // HP Recovery!
          const restoredHP = Math.min(100, stateRef.current.health + 30);
          stateRef.current.health = restoredHP;
          setHealth(restoredHP);

          // Bright green positive particles spray
          for (let p = 0; p < 16; p++) {
            const angle = (p * Math.PI) / 8;
            stateRef.current.particles.push({
              x: item.x,
              y: item.y,
              vx: Math.cos(angle) * 3.5,
              vy: Math.sin(angle) * 3.5,
              size: Math.random() * 3 + 1.5,
              color: "#10b981",
              alpha: 1.0,
              decay: 0.03
            });
          }

          // Clean/harvest collected item
          stateRef.current.hpItems.splice(hIndex, 1);
          continue;
        }

        // Reap missed items
        if (item.y > ch + 30) {
          stateRef.current.hpItems.splice(hIndex, 1);
        }
      }

      // 3. Handle Option Gates in "gatePhase"
      if (gState === "gatePhase") {
        // Gates slide down
        for (let g = 0; g < stateRef.current.gates.length; g++) {
          const gate = stateRef.current.gates[g];
          if (!gate) continue;

          // Slide on screen softly
          if (gate.y < 85) {
            gate.y += 2.5;
          }

          // Draw neon Gate Arch
          ctx.shadowBlur = 15;
          ctx.shadowColor = gate.color;
          ctx.strokeStyle = gate.color;
          ctx.lineWidth = 3;

          // Outer frame
          ctx.beginPath();
          ctx.arc(gate.x + gate.width / 2, gate.y + 15, 25, Math.PI, 0, false);
          ctx.lineTo(gate.x + gate.width / 2 + 25, gate.y + gate.height);
          ctx.lineTo(gate.x + gate.width / 2 - 25, gate.y + gate.height);
          ctx.closePath();
          ctx.stroke();

          // Gate transparent body fill
          ctx.fillStyle = `rgba(${parseInt(gate.color.slice(1,3),16) || 16}, ${parseInt(gate.color.slice(3,5),16) || 160}, ${parseInt(gate.color.slice(5,7),16) || 160}, 0.15)`;
          ctx.fill();

          // Gate alphabet badge (A, B, C, D)
          ctx.fillStyle = gate.color;
          ctx.beginPath();
          ctx.arc(gate.x + gate.width / 2, gate.y - 12, 11, 0, Math.PI * 2);
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.fillStyle = "#0c101a";
          ctx.font = "extrabold 12px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(gate.label, gate.x + gate.width / 2, gate.y - 12);

          // Subtext description keyword
          ctx.fillStyle = "#ffffff";
          ctx.font = "extrabold 15px sans-serif";
          ctx.fillText(gate.label, gate.x + gate.width / 2, gate.y + 40);

          // Check if player entered/collided with GATE arch
          const gateMidX = gate.x + gate.width / 2;
          const distToGate = Math.hypot(gateMidX - stateRef.current.playerX, (gate.y + 25) - stateRef.current.playerY);
          
          if (distToGate < 35 && stateRef.current.selectedOptionIdx === null) {
            // Selected gate index!
            const idxAnswer = gate.idx;
            stateRef.current.selectedOptionIdx = idxAnswer;
            setSelectedOptionIdx(idxAnswer);

            // Check correctness
            const correctness = idxAnswer === question.correctAnswer;
            stateRef.current.isCorrect = correctness;
            setIsCorrect(correctness);

            // Splash color explosion particles
            for (let p2 = 0; p2 < 25; p2++) {
              stateRef.current.particles.push({
                x: stateRef.current.playerX,
                y: gate.y + 20,
                vx: Math.random() * 8 - 4,
                vy: Math.random() * 8 - 4,
                size: Math.random() * 5 + 2,
                color: correctness ? "#10b981" : "#ef4444",
                alpha: 1.0,
                decay: 0.02,
              });
            }

            stateRef.current.gameState = "answered";
            setGameState("answered");

            // Inform Parent
            onAnswerSelected(idxAnswer, stateRef.current.timeLeft);
          }
        }
      }

      // 4. Update and Draw Particles
      for (let p3 = stateRef.current.particles.length - 1; p3 >= 0; p3--) {
        const pt = stateRef.current.particles[p3];
        if (!pt) continue;

        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= pt.decay;

        if (pt.alpha <= 0) {
          stateRef.current.particles.splice(p3, 1);
          continue;
        }

        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.alpha;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0; // Reset
      }

      // Decrement hitFlashFrames
      if (stateRef.current.hitFlashFrames > 0) {
        stateRef.current.hitFlashFrames--;
      }
      const isRedFlash = stateRef.current.hitFlashFrames > 0;

      // 5. Draw Player Character (Lantern of Knowledge 🏮)
      ctx.shadowBlur = gState === "answered" 
        ? (stateRef.current.isCorrect ? 30 : 10) 
        : (isRedFlash ? 28 : 15);
      ctx.shadowColor = gState === "answered" 
        ? (stateRef.current.isCorrect ? "#10b981" : "#ef4444") 
        : (isRedFlash ? "#ef4444" : "#14b8a6");
      
      const px = stateRef.current.playerX;
      const py = stateRef.current.playerY;

      // Draw custom glowing outer shield
      ctx.fillStyle = gState === "answered" 
        ? (stateRef.current.isCorrect ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)")
        : (isRedFlash ? "rgba(239, 68, 68, 0.5)" : "rgba(20, 184, 166, 0.2)");
      ctx.beginPath();
      ctx.arc(px, py, 24, 0, Math.PI * 2);
      ctx.fill();

      // Draw standard inner golden lantern 🏮 style
      ctx.fillStyle = gState === "answered"
        ? (stateRef.current.isCorrect ? "#10b981" : "#ef4444")
        : (isRedFlash ? "#f43f5e" : "#2dd4bf"); // Red when hit, Teal-300 otherwise
      ctx.beginPath();
      ctx.arc(px, py - 4, 11, 0, Math.PI * 2);
      ctx.fill();

      // Golden geometric lattice / base cap
      ctx.fillStyle = "#f59e0b"; // Gold Cap
      ctx.fillRect(px - 14, py - 16, 28, 4); // Top block
      ctx.fillRect(px - 14, py + 8, 28, 4);  // Bottom block

      // Inner glowing core
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(px, py - 4, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0; // Turn off shadows

      // Request next frame
      if (stateRef.current.gameState !== "intro" && stateRef.current.gameState !== "countdown") {
        animId = requestAnimationFrame(updateAndDraw);
      }
    };

    updateAndDraw();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gameState, question.id]);

  // Touch and drag track mechanics
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (gameState !== "playing" && gameState !== "gatePhase") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    if (touch) {
      // Calculate scaled coordinate
      const computedX = ((touch.clientX - rect.left) / rect.width) * canvas.width;
      const computedY = ((touch.clientY - rect.top) / rect.height) * canvas.height;
      stateRef.current.playerTargetX = Math.max(25, Math.min(canvas.width - 25, computedX));
      stateRef.current.playerTargetY = Math.max(30, Math.min(canvas.height - 30, computedY));
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== "playing" && gameState !== "gatePhase") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const computedX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const computedY = ((e.clientY - rect.top) / rect.height) * canvas.height;
    stateRef.current.playerTargetX = Math.max(25, Math.min(canvas.width - 25, computedX));
    stateRef.current.playerTargetY = Math.max(30, Math.min(canvas.height - 30, computedY));
  };

  // Direct Option Click Fallback Handler
  const handleDirectOptionClick = (idx: number) => {
    if (gameState === "answered") return;
    
    // Trigger manual select
    setSelectedOptionIdx(idx);
    stateRef.current.selectedOptionIdx = idx;

    const correctness = idx === question.correctAnswer;
    setIsCorrect(correctness);
    stateRef.current.isCorrect = correctness;

    setGameState("answered");
    stateRef.current.gameState = "answered";

    onAnswerSelected(idx, timeLeft);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top HUD bar with statistics */}
      <div className="bg-slate-900/85 backdrop-blur-md rounded-2xl border border-white/15 p-3.5 flex flex-wrap items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2">
          <div className="bg-teal-500/10 border border-teal-500/20 text-teal-300 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs">
            {currentIndex + 1}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium leading-none mb-1">
              {categoryName}
            </span>
            <span className="text-xs font-bold font-display">
              Soalan {currentIndex + 1} / {totalQuestions}
            </span>
          </div>
        </div>

        {/* Health Shield */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
            <Heart className={`w-4 h-4 text-emerald-450 ${health <= 25 ? "animate-pulse text-rose-500" : "text-emerald-400 fill-emerald-500/20"}`} />
            <div className="w-16 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-white/5">
              <div
                className={`h-full transition-all duration-300 ${health <= 25 ? "bg-rose-500 shadow-md shadow-rose-500/50" : "bg-emerald-400"}`}
                style={{ width: `${health}%` }}
              />
            </div>
            <span className={`text-[10px] font-mono font-black ${health <= 25 ? "text-rose-450 text-red-400" : "text-emerald-400"}`}>
              {health} HP
            </span>
          </div>

          {/* Core Ticking Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold text-xs ${
            timeLeft <= 5 
              ? "bg-rose-500/15 text-rose-450 border-rose-500/20 animate-pulse text-red-400" 
              : "bg-teal-500/10 text-teal-300 border-teal-500/25"
          }`}>
            <Zap className={`w-3.5 h-3.5 ${timeLeft <= 5 ? "animate-spin text-rose-400" : "text-teal-300"}`} />
            <span>{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* QUESTION CARD */}
      <div className="bg-slate-900/60 backdrop-blur-sm border border-white/10 p-5 rounded-2xl text-white space-y-1">
        <span className="inline-block bg-teal-400/10 border border-teal-500/20 text-teal-300 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          {question.category.toUpperCase()}
        </span>
        <h3 className="text-sm sm:text-base font-extrabold leading-normal text-white">
          {question.question}
        </h3>
      </div>

      {/* LOWER PANEL -> now MIDDLE PANEL: Full readable Option Cards Reference (and hybrid manual select) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>Rujukan Pilihan Jawapan ({gameState === "gatePhase" ? "Mod Gerbang Aktif 🚪" : "Seretan Pilot"})</span>
          <button
            type="button"
            onClick={() => setShowDirectOptions(prev => !prev)}
            className="text-teal-400 hover:underline outline-none underline-teal-600 text-[10px]"
          >
            {showDirectOptions ? "Sembunyikan Butang Pilihan" : "Tunjuk Butang Pilihan Klik Manual"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.options.map((opt, idx) => {
            const charLabel = String.fromCharCode(65 + idx); // A, B, C, D
            const isCorrectAnswer = idx === question.correctAnswer;
            const isCurSelected = selectedOptionIdx === idx;

            // Define borders / background colors matching gates
            const colorsMap = [
              "border-emerald-500 hover:bg-emerald-500/10 md:ring-emerald-500/20",
              "border-cyan-500 hover:bg-cyan-500/10 md:ring-cyan-500/20",
              "border-blue-500 hover:bg-blue-500/10 md:ring-blue-500/20",
              "border-purple-500 hover:bg-purple-500/10 md:ring-purple-500/20",
            ];
            const targetColorClass = colorsMap[idx] || "border-teal-500";

            let btnStyle = `border-white/10 bg-white/5 text-slate-300 ${targetColorClass}`;

            if (gameState === "answered") {
              if (isCorrectAnswer) {
                btnStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-305 font-bold";
              } else if (isCurSelected) {
                btnStyle = "border-rose-500 bg-rose-500/20 text-rose-300 font-medium";
              } else {
                btnStyle = "border-white/5 bg-white/5 text-slate-600 opacity-35";
              }
            } else if (gameState === "gatePhase") {
              // Glowing gates style references
              btnStyle = `bg-indigo-950/20 ${targetColorClass} text-white font-semibold shadow-md animate-pulse`;
            } else if (showDirectOptions) {
              btnStyle = `bg-white/5 hover:bg-white/10 cursor-pointer text-slate-200 border border-white/20`;
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={gameState === "answered" || (!showDirectOptions && gameState !== "gatePhase")}
                onClick={() => handleDirectOptionClick(idx)}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs tracking-wide transition-all select-none flex items-start gap-3 select-text ${btnStyle} ${
                  (!showDirectOptions && gameState === "playing") ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                <span className={`w-6 h-6 rounded-lg uppercase flex items-center justify-center text-xs font-black shrink-0 ${
                  idx === 0 ? "bg-emerald-500 text-slate-950" : 
                  idx === 1 ? "bg-cyan-500 text-slate-950" : 
                  idx === 2 ? "bg-blue-500 text-slate-950" : "bg-purple-500 text-slate-950"
                }`}>
                  {charLabel}
                </span>
                <span className="leading-tight pt-0.5">{opt}</span>
              </button>
            );
          })}
        </div>

        {gameState === "playing" && !showDirectOptions && (
          <p className="text-[10px] text-slate-500 italic text-center">
            * Butang pilihan dikunci semasa fasa pemanduan. Gunakan pergerakan pelita untuk masuki pintu gerbang pilihan anda, atau klik "Tunjuk Butang Pilihan Klik Manual" jika anda mahu menekan secara terus.
          </p>
        )}
      </div>

      {/* CENTRAL ADVENTURE GAMEPLAY STAGE */}
      <div className="relative w-full max-w-lg mx-auto overflow-hidden rounded-3xl border border-white/15 bg-[#080d17] aspect-[3/4] shadow-2xl">
        {/* Intro Start Card overlay */}
        {gameState === "intro" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#070b13]/90 text-white space-y-4">
            <div className="w-14 h-14 bg-teal-500/10 border border-teal-500/20 text-teal-300 rounded-full flex items-center justify-center">
              <Compass className="w-7 h-7 animate-spin" />
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="text-base font-extrabold text-teal-400 font-display">Cabaran Labyrinth Al-Quran</h2>
              <p className="text-xs text-slate-300 leading-relaxed px-5">
                Bantu Pelita Ilmu 🏮 berlayar melepasi ombak & halangan! Seret jari/tetikus untuk mengelak. Kemudian, pandu pelita ke Gerbang Jawapan yang betul di penamat!
              </p>
            </div>
            <button
              onClick={startQuizAdventure}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-teal-500/20 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" /> MULAKAN CABARAN ⚡
            </button>
          </div>
        )}

        {/* Countdown overlay */}
        {gameState === "countdown" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#070b13]/85 text-white">
            <span className="text-xs font-black tracking-widest text-teal-400 uppercase mb-2">Sedia Mengelak...</span>
            <div className="text-6xl font-black font-display animate-ping text-center inline-block w-20 h-20 leading-none">
              {countdown}
            </div>
          </div>
        )}

        {/* Dynamic gameplay canvas with logical dimensions 600x800 for taller play area and perfect stretch scale support */}
        <canvas
          ref={canvasRef}
          width={600}
          height={800}
          onTouchMove={handleTouchMove}
          onMouseMove={handleMouseMove}
          className="w-full h-full select-none block"
        />

        {/* Distance progress HUD */}
        {gameState === "playing" && (
          <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur border border-white/5 px-3 py-2 rounded-xl flex items-center justify-between text-[10px] text-white">
            <span className="font-bold flex items-center gap-1">
              <Compass className="w-3 h-3 text-cyan-400" />
              Progress Kembara: {distance}%
            </span>
            <div className="flex-1 max-w-[120px] bg-slate-800 h-2 rounded-full overflow-hidden mx-3 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all duration-300"
                style={{ width: `${distance}%` }}
              />
            </div>
            <span className="text-cyan-300 font-mono">GERBANG SEGERA</span>
          </div>
        )}

        {/* Gate Phase Alert overlay */}
        {gameState === "gatePhase" && (
          <div className="absolute bottom-3 left-4 right-4 bg-teal-900/80 backdrop-blur-md border border-teal-500/30 p-2.5 rounded-xl text-center z-10 animate-pulse">
            <strong className="text-xs text-teal-200 uppercase tracking-widest font-black block">
              🚧 PILIHAN KEBENARAN TIBA! 🚧
            </strong>
            <p className="text-[10px] text-slate-200 mt-1">
              Laluan ke hadapan! Pandu Pelita Ilmu 🏮 merentasi pintu pilihan [A, B, C atau D] mengikut jawapan anda!
            </p>
          </div>
        )}

        {/* Malfunction alert overlay */}
        {health <= 0 && gameState === "playing" && (
          <div className="absolute bottom-3 left-4 right-4 bg-rose-950/80 backdrop-blur-md border border-rose-500/30 p-2 rounded-xl text-center z-10 animate-pulse">
            <p className="text-[10px] text-rose-300">
              🚨 <b>PERISAI MELEPANG!</b> (HP 0). Sistem navigasi terganggu. Anda masih boleh menggunakan butang jawapan di bawah jika sukar mengemudi!
            </p>
          </div>
        )}

        {/* Results/Correctness Flash alert inside stage - scrollable vertically for 100% responsiveness */}
        {gameState === "answered" && (
          <div className={`absolute inset-0 z-25 flex flex-col items-center justify-start overflow-y-auto px-4 py-8 text-center bg-[#080d17]/95 text-white ${
            selectedOptionIdx === -1 
              ? "bg-rose-950/95" 
              : (isCorrect ? "bg-emerald-950/95" : "bg-rose-950/95")
          }`}>
            {selectedOptionIdx === -1 ? (
              <div className="space-y-3 w-full shrink-0">
                <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-full flex items-center justify-center mx-auto text-red-400">
                  <X className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-lg font-black font-display text-rose-400">Masa Menjawab Tamat!</h3>
                <p className="text-xs text-slate-350 max-w-sm mx-auto leading-relaxed">
                  Tempoh masa menjawab {timerLimit}s telah luput sepenuhnya. Jawapan tidak sempat dirakam tepat pada masanya.
                </p>
              </div>
            ) : isCorrect ? (
              <div className="space-y-3 w-full shrink-0">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 animate-bounce text-emerald-400" />
                </div>
                <h3 className="text-lg font-black font-display text-emerald-400">Masya Allah, Tepat sekali! 🎉</h3>
                <p className="text-xs text-slate-205 max-w-md mx-auto leading-relaxed text-emerald-100">
                  Pilihan jawapan anda adalah benar dan tepat.
                </p>
              </div>
            ) : (
              <div className="space-y-3 w-full shrink-0">
                <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto text-red-400">
                  <X className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black font-display text-rose-400">Kurang Tepat!</h3>
                <p className="text-xs text-slate-100 max-w-md mx-auto leading-relaxed">
                  Pilihan yang dimasuki adalah salah. Jawapan sebenar ialah:{" "}
                  <strong className="text-emerald-400 border-b border-dashed border-emerald-500/30">
                    {question.options[question.correctAnswer]}
                  </strong>
                </p>
              </div>
            )}

            {/* Hikmah Explanation */}
            <div className="bg-slate-900/80 border border-white/5 p-4 rounded-2xl max-w-md w-full mx-auto mt-4 text-[11px] text-slate-200 leading-relaxed text-left shrink-0">
              <span className="font-extrabold text-[9px] text-teal-400 block uppercase tracking-wider mb-0.5">
                Penerangan Hikmah:
              </span>
              {question.explanation}
            </div>

            <button
              onClick={onNextQuestion}
              className="mt-6 mb-4 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 shadow-lg text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0"
            >
              {isLastQuestion ? "Lihat Keputusan Akhir 🏁" : "Seterusnya →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
