/* Continuous synthesized noise; no media downloads or periodically repeated recording. */
class ClineFanNoise extends AudioWorkletProcessor {
  constructor() { super(); this.seed=0x51f15e; this.b0=0; this.b1=0; this.b2=0; this.b3=0; this.b4=0; this.b5=0; this.b6=0; }
  process(_inputs, outputs) {
    const pink=outputs[0][0], white=outputs[1][0];
    for(let i=0;i<pink.length;i++) {
      let s=this.seed; s^=s<<13; s^=s>>>17; s^=s<<5; this.seed=s;
      const w=(s>>>0)/2147483648-1;
      this.b0=.99886*this.b0+w*.0555179;
      this.b1=.99332*this.b1+w*.0750759;
      this.b2=.969*this.b2+w*.153852;
      this.b3=.8665*this.b3+w*.3104856;
      this.b4=.55*this.b4+w*.5329522;
      this.b5=-.7616*this.b5-w*.016898;
      pink[i]=(this.b0+this.b1+this.b2+this.b3+this.b4+this.b5+this.b6+w*.5362)*.11;
      this.b6=w*.115926; white[i]=w;
    }
    return true;
  }
}
registerProcessor('cline-fan-noise',ClineFanNoise);
