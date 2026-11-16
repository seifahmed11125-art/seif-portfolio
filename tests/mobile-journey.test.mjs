import test from 'node:test'
import assert from 'node:assert/strict'
import { createMobileTimeline, mobileJourneyAtOffset, remapMobileOffset } from '../src/lib/journey/mobile-journey.mjs'

test('each mobile chapter is fully readable before its flight and navigation stays on a reading plateau', () => {
  for (const height of [320, 480, 667, 844, 1024]) {
    const content = [800, 920, 700, 640], timeline = createMobileTimeline(content, height, 68, 64)
    for (const chapter of timeline.chapters) {
      const arrival = mobileJourneyAtOffset(chapter.anchor, timeline)
      assert.equal(arrival.progress, chapter.index)
      assert.equal(arrival.contentOffsets[chapter.index - 1], 0)
      const bottom = mobileJourneyAtOffset(chapter.readEnd, timeline)
      assert.equal(bottom.progress, chapter.index)
      assert.ok(Math.abs(bottom.contentOffsets[chapter.index - 1] - chapter.overflow) < 1e-9)
      assert.ok(chapter.top + content[chapter.index - 1] - chapter.overflow <= height - 64 - 20 + 1e-6)
    }
    assert.ok(Math.abs(timeline.scrollHeight - height - timeline.chapters.at(-1).leave) < 1e-9)
  }
})

test('mobile flights are continuous, reversible and never require more than two camera chapters', () => {
  const timeline = createMobileTimeline([800, 840, 760, 650], 844, 68, 64)
  let previous = 1
  for (let offset = 0; offset <= timeline.distance; offset += 5) {
    const state = mobileJourneyAtOffset(offset, timeline)
    assert.ok(state.progress >= previous && state.progress <= 4)
    assert.ok(state.progress - previous < .02)
    assert.deepEqual(mobileJourneyAtOffset(offset, timeline), mobileJourneyAtOffset(timeline.distance - (timeline.distance - offset), timeline))
    previous = state.progress
  }
})

test('rotation and content resize preserve the same chapter and point within a flight', () => {
  const before = createMobileTimeline([800, 840, 760, 650], 844, 68, 64)
  const after = createMobileTimeline([420, 700, 500, 600], 390, 68, 64)
  for (const chapter of before.chapters.slice(0, -1)) {
    const offset = chapter.leave + (chapter.end - chapter.leave) * .4
    const old = mobileJourneyAtOffset(offset, before), next = mobileJourneyAtOffset(remapMobileOffset(offset, before, after), after)
    assert.equal(old.chapter, next.chapter)
    assert.ok(Math.abs(old.progress - next.progress) < 1e-12)
  }
  const read = before.chapters[2]
  const mapped = mobileJourneyAtOffset(remapMobileOffset(read.readStart + read.overflow / 2, before, after), after)
  assert.equal(mapped.chapter, 3); assert.equal(mapped.traveling, false)
})
