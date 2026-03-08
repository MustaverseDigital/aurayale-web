import Link from "next/link";
import { LandingLayout } from "../components/landing/LandingLayout";

export default function LandingPage() {
  return (
    <LandingLayout activePage="home">
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-40">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-12">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-[10px] font-bold text-slate-300 tracking-[0.2em] uppercase">
              Forging Future Realities
            </span>
          </div>
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-white mb-8 leading-[0.95] text-gradient-landing">
            Architecture of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-primary to-purple-400">
              Next Gaming
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Redefining digital engagement through sovereign Web3 and high-fidelity Card Gaming.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="w-full sm:w-auto px-10 py-5 bg-white text-black hover:bg-slate-200 rounded-xl font-bold text-lg transition-all shadow-2xl shadow-white/5">
              Future Card Gaming
            </button>
            <button className="w-full sm:w-auto px-10 py-5 glass-panel text-white hover:bg-white/5 rounded-xl font-bold text-lg transition-all">
              View Dossier
            </button>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative z-10">
              <span className="text-primary font-bold tracking-widest text-xs uppercase mb-4 block">
                Our Philosophy
              </span>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
                Crafting the <br />Invisible Layer
              </h2>
              <div className="w-12 h-1 bg-gradient-to-r from-primary to-transparent mb-10" />
              <p className="text-slate-300 text-lg leading-relaxed mb-8 font-light">
                Mustaverse Studio functions at the intersection of spatial computing and decentralized systems.
                We architect immersive ecosystems where physical and digital boundaries dissolve.
              </p>
              <div className="grid grid-cols-2 gap-12 mt-12">
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="text-4xl font-display font-bold text-white mb-1">50+</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Deployments</p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="text-4xl font-display font-bold text-white mb-1">12</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Innovations</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[2rem] overflow-hidden glass-panel p-4 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent z-10" />
                <img
                  alt="Advanced conceptual 3D render"
                  className="w-full h-full object-cover rounded-2xl opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuARaEX6v6-TyAUU8ND66RT4iQI-SmhT-ouUkoISE2adJHTi4mn_K4k-RZ6LUOIvVyAb75Ps2TJrevuztLlD35HdTYxWxZ3kWlvkanTSw00JJ6taEoO5-CLiMLoXT85nTFsUbo5GYUMNTPM8Sq60tVXQ8Tsf9sf2QJvYsFrtkKs_25wV2mHF-dilRzogWt7P6lhfM9TMX8p4WxRcPlMcklpqIkUSuhSpR-lX_tDEMfA5AICLRKIEf2PgCrUQEJiYnKNjNRTmetiz5r8"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 glass-panel p-8 rounded-2xl shadow-2xl max-w-[280px] z-20">
                <div className="flex items-center gap-4 mb-4">
                  <span className="material-symbols-outlined text-primary text-4xl">model_training</span>
                  <h4 className="text-white font-bold text-sm tracking-tight">Economic Synthesis</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed uppercase tracking-wider">
                  Algorithmic incentive structures integrated into spatial environments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Competencies */}
      <section className="py-32 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl font-bold text-white mb-4 tracking-tight">Core Competencies</h2>
            <p className="text-slate-400 max-w-xl mx-auto font-light">
              A multidisciplinary approach to the decentralized spatial web.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "view_in_ar", title: "Spatial XR", desc: "Advanced AR/VR experiences leveraging high-fidelity rendering for industrial simulations and luxury retail showrooms." },
              { icon: "hub", title: "Web3 Infrastructure", desc: "Secure smart contract architecture and sovereign asset ownership layers for the next generation of digital commerce." },
              { icon: "auto_awesome", title: "Real-time Engine", desc: "Harnessing the power of Unreal Engine 5 to create hyper-realistic environments with dynamic lighting and physics." },
            ].map((item) => (
              <div key={item.title} className="glass-card p-10 rounded-3xl group">
                <div className="w-14 h-14 glass-panel rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 font-display">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Ventures */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Active Ventures
              </h2>
              <p className="text-slate-400 font-light">
                Internal R&amp;D products currently in early-access phase.
              </p>
            </div>
            <a className="text-xs font-bold uppercase tracking-[0.2em] text-primary hover:text-white flex items-center gap-2 transition-all" href="#">
              Registry <span className="material-symbols-outlined text-sm">north_east</span>
            </a>
          </div>
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Aurayale Card */}
            <div className="group relative rounded-[2.5rem] overflow-hidden glass-panel">
              <div className="aspect-video overflow-hidden">
                <img
                  alt="Aurayale conceptual environment"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-50 grayscale hover:grayscale-0"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_viMyrSUcfQ4m1tG3yncESAA6e2ym1MEnHMxggFRDiHMUnO7zDovSF9eQ5dgfBmuyYte0vqgTWYxhljps_gr_OzNh_PMD9T55NH0CmpLTbCpKV5nPqWeiRLMUn7Hrw-krQs4cgpPRT76sG2y_Q-3-RI3krH57UyKwW5LZJhOjfxUHbuAGSztxqij830f2Qd-OzXgrD5R8ZeIvBkRj8j87iR6J9HKH9OGB8cDLtw1jo39NDPLV0uPf_XCSGRxdwy2BM7Y9xwpej9E"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent flex flex-col justify-end p-12">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-4xl font-display font-bold text-white">Aurayale</h3>
                  <span className="px-4 py-1.5 glass-panel text-[10px] text-white rounded-full font-bold uppercase tracking-widest">
                    Sovereign MMORPG
                  </span>
                </div>
                <p className="text-slate-300 text-base mb-8 font-light max-w-md">
                  An expansive fantasy realm utilizing ZK-proofs for secure in-game asset ownership and decentralized governance.
                </p>
                <Link
                  href="/aurayale"
                  className="w-fit px-8 py-3 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Initialize Alpha
                </Link>
              </div>
            </div>
            {/* DEAL Card */}
            <div className="group relative rounded-[2.5rem] overflow-hidden glass-panel">
              <div className="aspect-video overflow-hidden">
                <img
                  alt="DEAL conceptual environment"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-50 grayscale hover:grayscale-0"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpvpxiOjtGJzz3qG46nPjvLP7pUOcR3wUEhffbSJF20GLabzpEmKGetNi0Fkiz9i-a0ZMtmuAgvX-a0LhW3X8Ash0mVOu3ll7X_JpeDdmPl82AW0hRgxj2JQSgNFd-IwxmQJft5O9k6MzSudTCqUKgKb9t83-fIM0sSHSIA1nYsyT4LMw81Y64Va8sJ-rGLGct7rDxlVl54ecqdiN7VD4iZLNlyv9Ze8uxEP3pYNRfFLdDxDa10OrX_f7b7onk-KCrmf3MmI08K4o"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent flex flex-col justify-end p-12">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-4xl font-display font-bold text-white">DEAL</h3>
                  <span className="px-4 py-1.5 glass-panel text-[10px] text-white rounded-full font-bold uppercase tracking-widest">
                    Protocol Layer
                  </span>
                </div>
                <p className="text-slate-300 text-base mb-8 font-light max-w-md">
                  A strategic card-based risk engine designed for cross-platform competitive play and financial abstraction.
                </p>
                <button className="w-fit px-8 py-3 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-slate-200 transition-colors">
                  Request Access
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Collective */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl font-bold text-white mb-4 tracking-tight">The Collective</h2>
            <p className="text-slate-400 font-light">Architects of the next digital frontier.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: "Kevin", role: "Founding Director", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZ6F_olKzLs6FlzBLmzsP_i9LOv2awBiVIT8GuK_WMWvTFIFo7JTxsm0tmWIicMfoyXpz107VrkuA72YviFrXPaf7m4YPFGuEu6lm_t3WqUC_C7zeiELk3bJeelZ4-uorpQGZUy6H9ARd91VVnYp22cnW0kG4A2O_d2Stca_01agTpSjz-hd9YQikSz-FULeuZHqY33HH17u5SSQTN_a9wF-YHvAVooBkVfiJw-pXZeV9Dmst_6wyiNPHS2RwtY5ZiV3RYMKY9iPg" },
              { name: "Wallce", role: "Chief Architect", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_VfAl-GHbCCpPgqBcvW_HawDRMBS0jKoZ-iTcbytUUJ57Sbee4K7_RNbIlIISSC-p9V6QSSb_jYvcbyatq7gZUsdLxQEPpTOdMUcoYsUqT6gJ1_36TZ7wa---zsplZ8TG41vFPCsDmdH2sR9RujuInk0LVFuxMGOmNgPrmpnU_r-_90ofM00tL4RKzKz1NR-ykhVj6LtGXBCcWeZRRC8Uz6mMO-RrelLHYfJe2SmM3lZHQ8D7zAbjGkrHmPGxhnKmawE_jAn6vMo" },
              { name: "Marcus Thorne", role: "Spatial Design Lead", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBb_yUtLdtJYhqouYPeGcQxmkaKNPtflntTruQGPBJzjNnt6IBESs11qUKMjNwtplWgfNjs4gn3tLOjUu-NTsirU7uh8l3RNj8Jqda0zih0DdpCkpIlT97r033D7h_1RCNC1FOV_8isxaed4DQVecQgrFGWOyAPidAI6RXwgzmzwjHfg5NllyJm7Ii9wrtj0PNX9MxGMsGykkdp8dbDkSTnyP7rF85iuCj8wS2FZbwN4p_P0MoxZdaSgG71D42WSLwISvuBHmxXliY" },
              { name: "Elena Rodriguez", role: "Visual Director", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYY5-rxQJwm6dMFAUqmAA5_0CqQY6x-xiD2ubji8ToXhfjx3N0PJRBjNa-0iYd3PIvNNnPojgktp4ZuMTPeTTe6TKGawBmdW9LH756e44X0V6_6tFhLf9IiZMQ3j3FWOLjauj33UHrCUWSJEsMnR7OKkXNCtvz7puqkOzeHRd8Jc22nRqdLyrLnqxAcjLEL6m24ajfUDJemBIiL_1lDeX12zb83fmXCMHaZKBKNtksVd46NwlfmOHW9yAGFpt9hhoAjrkXe9Dfrf0" },
            ].map((member) => (
              <div key={member.name} className="group">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-6 glass-panel relative">
                  <img
                    alt={`${member.name} Portrait`}
                    className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700"
                    src={member.img}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-all" />
                </div>
                <h3 className="text-lg font-bold text-white">{member.name}</h3>
                <p className="text-primary text-[10px] font-bold uppercase tracking-widest mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Network */}
      <section className="py-24 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mb-16">
            Global Network
          </h3>
          <div className="flex flex-wrap justify-center gap-x-16 gap-y-12">
            {[
              { icon: "token", name: "POLYCHAIN" },
              { icon: "deployed_code", name: "UNITY" },
              { icon: "view_in_ar", name: "UNREAL" },
              { icon: "account_balance_wallet", name: "METAMASK" },
              { icon: "language", name: "WEB3" },
            ].map((partner) => (
              <div
                key={partner.name}
                className="flex items-center gap-3 text-slate-400 grayscale hover:grayscale-0 hover:text-white transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-3xl">{partner.icon}</span>
                <span className="font-display font-bold text-lg tracking-tighter">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-background-dark to-background-dark z-0" />
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10 glass-panel py-24 rounded-[3rem]">
          <h2 className="font-display text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tighter">
            Let&apos;s Define the <br />New Standard
          </h2>
          <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Our team is ready to transform your vision into a production-grade digital reality.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-primary text-white px-12 py-5 rounded-xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-[0_20px_50px_rgba(99,102,241,0.3)]"
          >
            Start Consultation
          </Link>
        </div>
      </section>
    </LandingLayout>
  );
}
