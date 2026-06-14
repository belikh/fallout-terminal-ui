/**
 * VAULT BOY ANIMATION MANIFEST (34 STATES)
 * Integrated into RobCo OS 2287.4-EXT
 */

const VAULT_BOY_ANIMATIONS = [
  "idle",            // Default breathing cycle
  "walking",         // Standard movement
  "thumbs_up",       // Positive confirmation / OK state
  "alert",           // Danger / System warning (shaking)
  "radiation",       // Rad exposure / Environmental hazard
  "combat",          // Weapon ready / Active defense
  "crafting",        // Workbench / System construction
  "running",         // High-speed data / Critical escape
  "sleeping",        // Low power / Standby mode
  "dead",            // Fatal error / Power failure
  "strength",        // Heavy load / Resource overflow
  "perception",      // Scanning / Sensor active
  "endurance",       // Long-term stability / Uptime
  "charisma",        // Broadcast / Communication active
  "intelligence",    // Logic processing / Scripting
  "agility",         // Quick transition / Zero latency
  "luck",            // Critical success / RNG bonus
  "hacking",         // Terminal access / Security bypass
  "lockpicking",     // Mechanical access / Physical override
  "healing",         // System repair / Battery charging
  "trading",         // API exchange / Data transfer
  "scavenging",      // Resource discovery / Logging
  "repairing",       // Maintenance / Hardware fix
  "drinking",        // Liquid cooling / Fluid management
  "eating",          // Data consumption / Storage intake
  "chems",           // Performance boost / Overclocking
  "heavy_weapons",   // Mass notification / Group control
  "energy_weapons",  // Laser focus / Precision automation
  "explosives",      // Destructive action / Force delete
  "stealth",         // Private mode / Hidden entity
  "speech",          // Voice assistant / TTS active
  "science",         // Laboratory / Advanced logic
  "swimming",        // Data stream / Network flow
  "flying"           // Cloud sync / High-altitude telemetry
];

console.log("ROBCO ANIMATION MANIFEST LOADED:", VAULT_BOY_ANIMATIONS.length, "STATES READY.");
