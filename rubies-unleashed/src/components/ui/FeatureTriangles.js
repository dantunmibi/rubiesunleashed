import React from "react";
import { Cpu, Shield, Gamepad2 } from "lucide-react";

export default function FeatureTriangles() {
  const features = [
    { icon: <Cpu />, title: "High Performance", desc: "Optimized delivery network ensures your downloads are lightning fast.", color: "text-ruby bg-ruby/10" },
    { icon: <Shield />, title: "Secure & Verified", desc: "Every gem in the vault is verified safe. No malware, just pure gaming.", color: "text-blue-400 bg-blue-500/10" },
    { icon: <Gamepad2 />, title: "Indie First", desc: "Built to spotlight hidden gems often overlooked by major platforms.", color: "text-purple-400 bg-purple-500/10" }
  ];

  return (
    <section className="mb-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i} className="group relative p-8 md:p-10 rounded-3xl bg-surface border border-white/5 hover:border-ruby/30 transition-all hover:-translate-y-2 hover:bg-white/2 hover:shadow-2xl hover:shadow-ruby/5">
            <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
              {React.cloneElement(f.icon, { size: 28 })}
            </div>
            <h4 className="text-xl font-black text-white mb-3 uppercase tracking-tight">{f.title}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            <div className="absolute bottom-6 right-6 text-white/5 font-black text-6xl group-hover:text-ruby/10 transition-colors select-none">
              0{i + 1}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}