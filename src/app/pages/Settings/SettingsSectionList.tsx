import type { SettingSection } from "./types";

interface SettingsSectionListProps {
  sections: SettingSection[];
}

export function SettingsSectionList({ sections }: SettingsSectionListProps) {
  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <div
          key={index}
          className="p-6 rounded-3xl bg-[#FFFDF1]"
          style={{
            boxShadow:
              "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
          }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div
              className="p-3 rounded-2xl bg-gradient-to-br from-[#628141] to-[#8BAE66]"
              style={{
                boxShadow:
                  "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
              }}
            >
              <section.icon className="w-6 h-6 text-[#FFFDF1]" />
            </div>
            <div>
              <h3 className="text-[#1B211A]">{section.title}</h3>
              <p className="text-[#628141] text-sm">{section.description}</p>
            </div>
          </div>

          {section.fields && (
            <div className="space-y-4">
              {section.fields.map((field, idx) => (
                <div key={idx}>
                  <label className="text-[#628141] text-sm mb-2 block">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    defaultValue={field.value}
                    readOnly={field.readonly}
                    className={`w-full px-4 py-3 rounded-2xl bg-[#EBD5AB]/20 text-[#1B211A] border-none outline-none ${
                      field.readonly ? "cursor-not-allowed opacity-70" : ""
                    }`}
                    style={{
                      boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {section.toggles && (
            <div className="space-y-4 mt-4">
              {section.toggles.map((toggle, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-[#1B211A]">{toggle.label}</span>
                  <button
                    onClick={() => toggle.setter(!toggle.state)}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      toggle.state
                        ? "bg-gradient-to-r from-[#628141] to-[#8BAE66]"
                        : "bg-[#EBD5AB]"
                    }`}
                    style={{
                      boxShadow: toggle.state
                        ? "0 4px 12px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)"
                        : "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
                    }}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-[#FFFDF1] transition-transform ${
                        toggle.state ? "translate-x-7" : "translate-x-0"
                      }`}
                      style={{
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
