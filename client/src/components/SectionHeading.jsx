import React from 'react';

const SectionHeading = ({ eyebrow, title, description, align = 'left', light = false }) => {
  const alignmentClasses =
    align === 'center' ? 'mx-auto text-center items-center' : 'text-left items-start';
  const titleClasses = light ? 'text-white' : 'text-slate-900';
  const descriptionClasses = light ? 'text-white/80' : 'text-slate-600';

  return (
    <div className={`flex max-w-3xl flex-col gap-3 ${alignmentClasses}`}>
      {eyebrow ? (
        <span
          className={`inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${
            light ? 'bg-white/10 text-white/80' : 'bg-brand-red/10 text-brand-red'
          }`}
        >
          {eyebrow}
        </span>
      ) : null}
      <h2 className={`text-3xl font-extrabold leading-tight md:text-4xl ${titleClasses}`}>
        {title}
      </h2>
      {description ? (
        <p className={`text-base leading-7 md:text-lg ${descriptionClasses}`}>{description}</p>
      ) : null}
    </div>
  );
};

export default SectionHeading;
