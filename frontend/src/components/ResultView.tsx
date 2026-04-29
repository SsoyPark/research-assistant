// frontend/src/components/ResultView.tsx

interface Props {
  data: any
}

export default function ResultView({ data }: Props) {
  const jd = data.jd_analysis?.analysis
  const strategy = data.strategy?.strategy
  const company = data.company_analysis?.summary
  const experience = data.experience_analysis

  return (
    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* 헤더 */}
      <div style={{ padding: '1rem 1.25rem', background: '#e8f0fe', borderRadius: '12px' }}>
        <h2 style={{ margin: '0 0 2px', fontSize: '1.1rem' }}>{data.company} · {data.role}</h2>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#555' }}>분석 완료</p>
      </div>

      {/* 내 경험 요약 */}
      {experience && (
        <Section title="👤 내 경험 분석">
          <p style={descStyle}>{experience.summary}</p>
          <p style={{ ...labelStyle, marginTop: '0.75rem' }}>추출된 핵심 키워드</p>
          <TagList items={experience.keywords} color="#e8f0fe" textColor="#1a73e8" />
          {experience.strengths?.length > 0 && (
            <>
              <p style={{ ...labelStyle, marginTop: '0.75rem' }}>강점</p>
              {experience.strengths.map((s: string, i: number) => (
                <p key={i} style={bulletStyle}>• {s}</p>
              ))}
            </>
          )}
        </Section>
      )}

      {/* 기업 분석 */}
      {company && (
        <Section title="🏢 기업 분석">
          {company.business_domain && (
            <>
              <p style={labelStyle}>사업 도메인</p>
              <p style={descStyle}>{company.business_domain}</p>
            </>
          )}
          {company.ai_strategy && (
            <>
              <p style={{ ...labelStyle, marginTop: '0.75rem' }}>AI 전략</p>
              <p style={descStyle}>{company.ai_strategy}</p>
            </>
          )}
          {company.key_info?.length > 0 && (
            <>
              <p style={{ ...labelStyle, marginTop: '0.75rem' }}>지원자 필수 정보</p>
              {company.key_info.map((info: string, i: number) => (
                <p key={i} style={bulletStyle}>• {info}</p>
              ))}
            </>
          )}
        </Section>
      )}

      {/* JD 분석 */}
      <Section title="📋 JD 분석">
        <p style={labelStyle}>필수 기술</p>
        <TagList items={jd?.required_skills} color="#fff0f0" textColor="#c00" />
        <p style={{ ...labelStyle, marginTop: '0.75rem' }}>우대 기술</p>
        <TagList items={jd?.preferred_skills} color="#f0fff0" textColor="#060" />
        <p style={{ ...labelStyle, marginTop: '0.75rem' }}>핵심 역량</p>
        <TagList items={jd?.key_competencies} color="#f5f0ff" textColor="#606" />
        <p style={{ ...labelStyle, marginTop: '0.75rem' }}>직무 요약</p>
        <p style={descStyle}>{jd?.summary}</p>
      </Section>

      {/* 갭 분석 */}
      <Section title="🎯 갭 분석">
        <p style={labelStyle}>✅ 매칭되는 키워드</p>
        <TagList items={strategy?.matched_keywords} color="#e8f0fe" textColor="#1a73e8" />
        <p style={{ ...labelStyle, marginTop: '0.75rem' }}>⚠️ 보완 필요</p>
        <TagList items={strategy?.gap_keywords} color="#fff0f0" textColor="#c00" />
      </Section>

      {/* 자소서 전략 */}
      <Section title="✍️ 자소서 어필 포인트">
        {strategy?.appeal_points?.map((point: string, i: number) => (
          <div key={i} style={{ marginBottom: '1rem' }}>
            <p style={{ fontWeight: '600', fontSize: '0.875rem', margin: '0 0 4px', color: '#1a73e8' }}>
              {i + 1}. {point}
            </p>
            <p style={{ ...descStyle, background: '#f9f9f9', padding: '8px 12px', borderRadius: '8px' }}>
              {strategy?.recommended_experiences?.[point]}
            </p>
          </div>
        ))}
      </Section>

      {/* 자소서 항목별 전략 */}
      {strategy?.jasoseo_strategies && data.strategy?.jasoseo_items?.length > 0 && (
        <Section title="📝 자소서 항목별 전략">
          {data.strategy.jasoseo_items.map((item: string, i: number) => {
            const s = strategy.jasoseo_strategies?.[String(i + 1)]
            if (!s) return null
            return (
              <div key={i} style={{ marginBottom: '1.25rem', padding: '1rem',
                background: '#f9f9f9', borderRadius: '10px' }}>
                {/* 항목 원문 */}
                <p style={{ fontSize: '0.8rem', color: '#888', margin: '0 0 8px',
                  borderLeft: '3px solid #1a73e8', paddingLeft: '8px' }}>
                  {item.length > 80 ? item.slice(0, 80) + '...' : item}
                </p>
                {/* 기업 의도 */}
                <p style={{ fontSize: '0.8rem', fontWeight: '600', color: '#555', margin: '0 0 4px' }}>
                  💡 기업이 보려는 것
                </p>
                <p style={{ fontSize: '0.875rem', color: '#444', margin: '0 0 10px', lineHeight: 1.6 }}>
                  {s.intent}
                </p>
                {/* 전략 */}
                <p style={{ fontSize: '0.8rem', fontWeight: '600', color: '#555', margin: '0 0 4px' }}>
                  ✍️ 전략
                </p>
                <p style={{ fontSize: '0.875rem', color: '#444', margin: '0 0 10px', lineHeight: 1.6 }}>
                  {s.strategy}
                </p>
                {/* 키워드 */}
                <p style={{ fontSize: '0.8rem', fontWeight: '600', color: '#555', margin: '0 0 6px' }}>
                  🔑 강조 키워드
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                  {s.keywords?.map((kw: string, j: number) => (
                    <span key={j} style={{ padding: '3px 10px', borderRadius: '20px',
                      background: '#e8f0fe', color: '#1a73e8', fontSize: '0.8rem' }}>
                      {kw}
                    </span>
                  ))}
                </div>
                {/* 주의사항 */}
                <p style={{ fontSize: '0.8rem', fontWeight: '600', color: '#555', margin: '0 0 4px' }}>
                  ⚠️ 주의할 점
                </p>
                <p style={{ fontSize: '0.875rem', color: '#888', margin: 0, lineHeight: 1.6 }}>
                  {s.caution}
                </p>
              </div>
            )
          })}
        </Section>
      )}

      {/* 예상 면접 질문 */}
      <Section title="💬 예상 면접 질문">
        {strategy?.interview_questions?.map((q: string, i: number) => (
          <div key={i} style={{ marginBottom: '0.75rem', padding: '12px',
            background: '#f9f9f9', borderRadius: '8px', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Q{i + 1}. {q}
          </div>
        ))}
      </Section>

    </div>
  )
}

// 공통 스타일
const labelStyle: React.CSSProperties = {
  fontSize: '0.78rem', fontWeight: '600', color: '#666', margin: '0 0 6px'
}
const descStyle: React.CSSProperties = {
  fontSize: '0.875rem', color: '#444', margin: 0, lineHeight: 1.6
}
const bulletStyle: React.CSSProperties = {
  fontSize: '0.875rem', color: '#444', margin: '2px 0', lineHeight: 1.6
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '1.25rem' }}>
      <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem' }}>{title}</h3>
      {children}
    </div>
  )
}

function TagList({ items, color, textColor }: { items: string[]; color: string; textColor: string }) {
  if (!items?.length) return <p style={{ fontSize: '0.8rem', color: '#aaa' }}>없음</p>
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {items.map((item, i) => (
        <span key={i} style={{
          padding: '4px 10px', borderRadius: '20px',
          background: color, color: textColor, fontSize: '0.8rem'
        }}>
          {item}
        </span>
      ))}
    </div>
  )
}