/**
 * WBTI(웰니스 유형 검사) 관련 타입 정의.
 * 9문항 = 3축(purpose/direction/action) × 3문항, 각 축의 다수결(2/3)로 8종 유형을 판정한다.
 *
 * 3대 축 (공식 기준 문서 "W-BTI 성향 분류 기준" 기준):
 * - purpose(목적): S(Social/사회적) vs P(Personal/개인적)
 * - direction(방향): E(External/외적) vs I(Internal/내적)
 * - action(행동): F(Flexible/유연한) vs R(Regular/규칙적인)
 */

export type WbtiAxis = "purpose" | "direction" | "action";

export type WbtiAxisCode = "S" | "P" | "E" | "I" | "F" | "R";

export interface WbtiOption {
  code: WbtiAxisCode;
  label: string;
}

export interface WbtiQuestion {
  id: number;
  axis: WbtiAxis;
  prompt: string;
  emoji?: string;
  options: [WbtiOption, WbtiOption];
}

/** questionId -> 선택한 옵션의 축 코드 */
export type WbtiAnswerMap = Record<number, WbtiAxisCode>;

/** 목적(S/P) + 방향(E/I) + 행동(F/R) 조합 8종 */
export type WbtiTypeId =
  | "SEF"
  | "SER"
  | "SIF"
  | "SIR"
  | "PEF"
  | "PER"
  | "PIF"
  | "PIR";

export interface WbtiTypeInfo {
  typeId: WbtiTypeId;
  /** WBTI 유형명 (예: "셀러브리티형") */
  title: string;
  /** 그 유형에 어울리는 힐링/웰니스 스타일명 (예: "소셜 핫플형") */
  healingStyle: string;
  emoji: string;
  catchphrase: string;
  suggestion: string;
  /** 매핑 카테고리 (예: ["브런치 카페", "피크닉 명소"]) — 현재는 데이터만 보유, UI 미사용 */
  placeCategories: string[];
  /** 실제 유형별 캐릭터 이미지 에셋이 준비되면 채워서 사용 (현재는 placeholder 이미지 사용) */
  imageUrl?: string;
}
