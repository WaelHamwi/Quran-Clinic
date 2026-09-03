@php
    $statePath   = $getStatePath();
    $recordings  = $getRecordings();
    $selectedIds = $getSelectedIds();
    $isDisabled  = $isDisabled();
@endphp

<x-dynamic-component :component="$getFieldWrapperView()" :field="$field">
    {{-- The sequence lives in the Livewire snapshot from here on, so the DOM
         states it too: it is what to look at when a form comes back not
         holding what was saved, and what the render tests assert against. --}}
    <div
        class="mq-rp"
        data-sequence="{{ implode(',', $selectedIds) }}"
        x-data="{
            search: '',
            limit: @js($getInitiallyVisible()),
            playingId: null,
            options: @js(collect($recordings)->map(fn ($r) => ['id' => (string) $r['id'], 'search' => $r['search']])->values()),

            // Card details keyed by id, so a sequence row can name itself
            // without scanning the whole card list on every render.
            cards: @js((object) collect($getRecordingsById())->map(fn ($r) => [
                'code'     => $r['code'],
                'excerpt'  => $r['excerpt'],
                'duration' => $r['duration'],
            ])->all()),

            // The ordered sequence of recording ids — THE state of this field.
            // A repeated id is a repeated session, not a duplicate: entries are
            // addressed by position, never by id, so the same recording can sit
            // at the beginning, the middle and the end of one ruqyah.
            sequence: $wire.$entangle(@js($statePath)),

            init() {
                // Every path through the field hydrates an array, but a null
                // would turn the first Add into a crash rather than a no-op.
                if (! Array.isArray(this.sequence)) this.sequence = [];
            },

            cardOf(id) {
                return this.cards[String(id)] ?? { code: '#' + id, excerpt: '— unknown recording —', duration: null };
            },
            countOf(id) {
                return this.sequence.filter((v) => String(v) === String(id)).length;
            },
            add(id) {
                this.sequence.push(String(id));
            },
            removeAt(index) {
                this.sequence.splice(index, 1);
            },
            moveBy(index, delta) {
                const target = index + delta;
                if (target < 0 || target >= this.sequence.length) return;
                const moved = this.sequence.splice(index, 1)[0];
                this.sequence.splice(target, 0, moved);
            },

            get matching() {
                const term = this.search.trim().toLowerCase();
                if (term === '') return this.options;
                return this.options.filter((o) => o.search.includes(term));
            },
            get visibleIds() {
                const ids = new Set(this.matching.slice(0, this.limit).map((o) => o.id));
                // Never hide something already in the sequence, or the admin
                // loses sight of what they picked behind 'Show more'.
                for (const id of this.sequence) ids.add(String(id));
                return ids;
            },
            get hiddenCount() {
                return Math.max(0, this.matching.length - this.limit);
            },
            isVisible(id) {
                return this.visibleIds.has(String(id));
            },
            showMore() {
                this.limit += 10;
            },
            showAll() {
                this.limit = this.options.length;
            },
            collapse() {
                this.limit = @js($getInitiallyVisible());
                this.playingId = null;
                this.$refs.audio?.pause();
            },
            toggleAudio(id, url) {
                const audio = this.$refs.audio;
                if (! audio) return;

                if (this.playingId === String(id)) {
                    audio.pause();
                    this.playingId = null;
                    return;
                }

                audio.src = url;
                audio.play().then(() => { this.playingId = String(id); }).catch(() => { this.playingId = null; });
            },
        }"
    >
        <audio x-ref="audio" x-on:ended="playingId = null" preload="none" class="mq-rp-audio"></audio>

        @if (count($recordings) === 0)
            <p class="mq-rp-empty">{{ $getEmptyMessage() }}</p>
        @else
            {{-- The sequence, in play order. This is what the item actually
                 holds; the card list below is only the source to draw from. --}}
            <div class="mq-rp-seq">
                <p class="mq-rp-seq-head">
                    Plays in this order
                    <span class="mq-rp-dim">— <span x-text="sequence.length"></span> session(s)</span>
                </p>

                <p class="mq-rp-empty" x-show="sequence.length === 0">
                    Nothing added yet. Use “Add” on a recording below; add it again wherever the ruqyah repeats it.
                </p>

                <template x-for="(id, index) in sequence" :key="index">
                    <div class="mq-rp-seq-row">
                        <span class="mq-rp-seq-no" x-text="index + 1"></span>

                        <span class="mq-rp-seq-body">
                            <span class="mq-rp-seq-text" dir="auto" x-text="cardOf(id).excerpt"></span>
                            <span class="mq-rp-meta">
                                <span class="mq-rp-tag mq-rp-tag--code" dir="auto" x-text="cardOf(id).code"></span>
                                <template x-if="cardOf(id).duration">
                                    <span class="mq-rp-tag" x-text="cardOf(id).duration"></span>
                                </template>
                                {{-- Says out loud that a repeat is deliberate, so nobody
                                     "cleans up" what reads at a glance as a mistake. --}}
                                <template x-if="countOf(id) > 1">
                                    <span class="mq-rp-tag mq-rp-tag--accent">
                                        repeated <span x-text="countOf(id)"></span>× here
                                    </span>
                                </template>
                            </span>
                        </span>

                        @unless ($isDisabled)
                            <span class="mq-rp-seq-tools">
                                <button
                                    type="button"
                                    class="mq-rp-icon"
                                    x-bind:disabled="index === 0"
                                    x-on:click="moveBy(index, -1)"
                                    aria-label="Move earlier"
                                >↑</button>
                                <button
                                    type="button"
                                    class="mq-rp-icon"
                                    x-bind:disabled="index === sequence.length - 1"
                                    x-on:click="moveBy(index, 1)"
                                    aria-label="Move later"
                                >↓</button>
                                <button
                                    type="button"
                                    class="mq-rp-icon mq-rp-icon--danger"
                                    x-on:click="removeAt(index)"
                                    aria-label="Remove this session"
                                >✕</button>
                            </span>
                        @endunless
                    </div>
                </template>
            </div>

            <div class="mq-rp-toolbar">
                <input
                    type="search"
                    class="mq-rp-search"
                    placeholder="Search by code or recording text…"
                    x-model.debounce.200ms="search"
                    @disabled($isDisabled)
                />
                <span class="mq-rp-count">
                    <span x-text="sequence.length"></span> in sequence
                    <span class="mq-rp-dim">from {{ count($recordings) }}</span>
                </span>
            </div>

            <div class="mq-rp-list">
                @foreach ($recordings as $recording)
                    @php $id = (string) $recording['id']; @endphp

                    <div
                        class="mq-rp-card"
                        x-show="isVisible(@js($id))"
                        x-bind:class="countOf(@js($id)) > 0 && 'mq-rp-card--on'"
                        wire:key="{{ $statePath }}.{{ $id }}"
                    >
                        @unless ($isDisabled)
                            <button
                                type="button"
                                class="mq-rp-add"
                                x-on:click="add(@js($id))"
                                aria-label="Add this recording to the sequence"
                            >+ Add</button>
                        @endunless

                        <span class="mq-rp-body">
                            <span class="mq-rp-text" dir="auto">{{ $recording['excerpt'] }}</span>

                            <span class="mq-rp-meta">
                                {{-- The code the ruqyah is filed under in the source sheet: the
                                     handle an admin matches this card against, so it leads. --}}
                                <span class="mq-rp-tag mq-rp-tag--code" dir="auto">{{ $recording['code'] }}</span>
                                @if ($recording['duration'])
                                    <span class="mq-rp-tag">{{ $recording['duration'] }}</span>
                                @endif
                                <span class="mq-rp-tag">{{ $recording['linked_label'] }}</span>
                                @if ($recording['is_general'])
                                    <span class="mq-rp-tag mq-rp-tag--accent">General Ruqyah</span>
                                @endif
                                @if (! $recording['has_audio'])
                                    <span class="mq-rp-tag mq-rp-tag--warn">no audio</span>
                                @endif
                                <template x-if="countOf(@js($id)) > 0">
                                    <span class="mq-rp-tag mq-rp-tag--on">
                                        in this sequence <span x-text="countOf(@js($id))"></span>×
                                    </span>
                                </template>
                            </span>
                        </span>

                        @if ($recording['has_audio'])
                            <button
                                type="button"
                                class="mq-rp-play"
                                x-on:click.prevent.stop="toggleAudio(@js($id), @js($recording['audio_url']))"
                                x-bind:class="playingId === @js($id) && 'mq-rp-play--on'"
                                x-bind:aria-label="playingId === @js($id) ? 'Pause preview' : 'Play preview'"
                            >
                                <span x-show="playingId !== @js($id)">▶</span>
                                <span x-show="playingId === @js($id)" x-cloak>❚❚</span>
                            </button>
                        @endif
                    </div>
                @endforeach

                <p class="mq-rp-empty" x-show="matching.length === 0" x-cloak>
                    No recording matches that text.
                </p>
            </div>

            <div class="mq-rp-actions">
                <button type="button" class="mq-rp-btn" x-show="hiddenCount > 0" x-on:click="showMore()">
                    Show more (<span x-text="hiddenCount"></span> hidden)
                </button>
                <button type="button" class="mq-rp-btn" x-show="hiddenCount > 0" x-on:click="showAll()">
                    Show all
                </button>
                <button
                    type="button"
                    class="mq-rp-btn"
                    x-show="hiddenCount === 0 && limit > @js($getInitiallyVisible())"
                    x-cloak
                    x-on:click="collapse()"
                >
                    Show less
                </button>
            </div>
        @endif
    </div>

    @once
        <style>
            .mq-rp-audio { display: none; }
            .mq-rp-toolbar { display: flex; align-items: center; gap: .625rem; margin-bottom: .625rem; }
            .mq-rp-search {
                flex: 1; min-width: 0; padding: .45rem .7rem; font-size: .8125rem;
                border: 1px solid rgba(99,102,241,.22); border-radius: 9px;
                background: rgba(255,255,255,.75); color: inherit;
            }
            .mq-rp-search:focus { outline: none; box-shadow: 0 0 0 3px rgba(99,102,241,.15); border-color: rgba(99,102,241,.5); }
            .dark .mq-rp-search { background: rgba(6,14,38,.6); border-color: rgba(99,102,241,.25); }
            .mq-rp-count { font-size: .75rem; font-weight: 600; white-space: nowrap; opacity: .8; }
            .mq-rp-dim { opacity: .55; font-weight: 400; }

            /* The sequence panel: what the item holds, above the source list. */
            .mq-rp-seq {
                margin-bottom: .875rem; padding: .625rem .7rem;
                border: 1px solid rgba(99,102,241,.22); border-radius: 12px;
                background: rgba(99,102,241,.05);
            }
            .dark .mq-rp-seq { background: rgba(99,102,241,.1); border-color: rgba(99,102,241,.24); }
            .mq-rp-seq-head { font-size: .75rem; font-weight: 700; margin-bottom: .5rem; }
            .mq-rp-seq-row {
                display: flex; align-items: flex-start; gap: .5rem;
                padding: .4rem .3rem; border-top: 1px solid rgba(99,102,241,.12);
            }
            .mq-rp-seq-row:first-of-type { border-top: none; }
            .mq-rp-seq-no {
                flex: none; width: 1.4rem; height: 1.4rem; border-radius: 99px;
                display: flex; align-items: center; justify-content: center;
                font-size: .6875rem; font-weight: 700;
                background: #6366f1; color: #fff;
            }
            .mq-rp-seq-body { display: flex; flex-direction: column; gap: .3rem; min-width: 0; flex: 1; }
            .mq-rp-seq-text {
                font-size: .8125rem; line-height: 1.5; word-break: break-word;
                display: -webkit-box; -webkit-line-clamp: 1; line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
            }
            .mq-rp-seq-tools { display: flex; gap: .25rem; flex: none; }
            .mq-rp-icon {
                width: 1.6rem; height: 1.6rem; border-radius: 8px; cursor: pointer;
                display: flex; align-items: center; justify-content: center; font-size: .75rem;
                border: 1px solid rgba(99,102,241,.28); background: rgba(255,255,255,.7); color: #4f46e5;
            }
            .mq-rp-icon:hover:not(:disabled) { background: rgba(99,102,241,.18); }
            .mq-rp-icon:disabled { opacity: .35; cursor: default; }
            .mq-rp-icon--danger { color: #b91c1c; border-color: rgba(185,28,28,.28); }
            .mq-rp-icon--danger:hover { background: rgba(185,28,28,.12); }
            .dark .mq-rp-icon { background: rgba(6,14,38,.5); color: #a5b4fc; }
            .dark .mq-rp-icon--danger { color: #fca5a5; }

            .mq-rp-list { display: flex; flex-direction: column; gap: .375rem; }

            .mq-rp-card {
                display: flex; align-items: flex-start; gap: .625rem;
                padding: .5rem .625rem;
                border: 1px solid rgba(99,102,241,.12); border-radius: 11px;
                background: rgba(255,255,255,.6);
                transition: border-color .16s ease, background .16s ease;
            }
            .mq-rp-card:hover { border-color: rgba(99,102,241,.34); background: rgba(255,255,255,.9); }
            .mq-rp-card--on { border-color: rgba(99,102,241,.55); background: rgba(99,102,241,.07); }
            .dark .mq-rp-card { background: rgba(6,14,38,.5); border-color: rgba(99,102,241,.14); }
            .dark .mq-rp-card:hover { background: rgba(10,20,55,.75); border-color: rgba(99,102,241,.36); }
            .dark .mq-rp-card--on { background: rgba(99,102,241,.16); border-color: rgba(99,102,241,.5); }

            .mq-rp-add {
                flex: none; margin-top: .05rem; padding: .3rem .55rem; border-radius: 8px; cursor: pointer;
                font-size: .6875rem; font-weight: 700; white-space: nowrap;
                border: 1px solid rgba(99,102,241,.4); background: rgba(99,102,241,.12); color: #4f46e5;
                transition: background .16s ease;
            }
            .mq-rp-add:hover { background: #6366f1; color: #fff; }
            .dark .mq-rp-add { color: #a5b4fc; background: rgba(99,102,241,.2); }

            .mq-rp-body { display: flex; flex-direction: column; gap: .3rem; min-width: 0; flex: 1; }
            .mq-rp-text {
                font-size: .8125rem; line-height: 1.55; word-break: break-word;
                display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
            }
            .mq-rp-meta { display: flex; flex-wrap: wrap; gap: .3rem; align-items: center; }
            .mq-rp-tag {
                font-size: .6875rem; font-weight: 600; padding: .1rem .4rem; border-radius: 99px;
                background: rgba(99,102,241,.1); color: #4f46e5; white-space: nowrap;
            }
            .dark .mq-rp-tag { background: rgba(99,102,241,.2); color: #a5b4fc; }
            /* The code identifies the card, so it reads as a label rather than
               as one more piece of metadata beside it. */
            .mq-rp-tag--code {
                font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
                letter-spacing: .01em;
                background: rgba(79,70,229,.16); color: #3730a3;
            }
            .dark .mq-rp-tag--code { background: rgba(129,140,248,.24); color: #c7d2fe; }
            .mq-rp-tag--accent { background: rgba(16,185,129,.13); color: #047857; }
            .dark .mq-rp-tag--accent { background: rgba(16,185,129,.2); color: #6ee7b7; }
            .mq-rp-tag--warn { background: rgba(245,158,11,.15); color: #b45309; }
            .dark .mq-rp-tag--warn { background: rgba(245,158,11,.22); color: #fcd34d; }
            .mq-rp-tag--on { background: #6366f1; color: #fff; }
            .dark .mq-rp-tag--on { background: #6366f1; color: #fff; }

            .mq-rp-play {
                flex: none; width: 1.9rem; height: 1.9rem; border-radius: 99px; cursor: pointer;
                display: flex; align-items: center; justify-content: center; font-size: .7rem;
                border: 1px solid rgba(99,102,241,.28); background: rgba(99,102,241,.1); color: #4f46e5;
                transition: background .16s ease, color .16s ease;
            }
            .mq-rp-play:hover { background: rgba(99,102,241,.22); }
            .mq-rp-play--on { background: #6366f1; color: #fff; border-color: #6366f1; }
            .dark .mq-rp-play { color: #a5b4fc; background: rgba(99,102,241,.18); }

            .mq-rp-actions { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .625rem; }
            .mq-rp-btn {
                font-size: .75rem; font-weight: 600; padding: .35rem .75rem; border-radius: 9px; cursor: pointer;
                border: 1px solid rgba(99,102,241,.28); background: rgba(99,102,241,.08); color: #4f46e5;
                transition: background .16s ease;
            }
            .mq-rp-btn:hover { background: rgba(99,102,241,.18); }
            .dark .mq-rp-btn { color: #a5b4fc; background: rgba(99,102,241,.16); }

            .mq-rp-empty { font-size: .8125rem; opacity: .65; padding: .5rem .125rem; }
        </style>
    @endonce
</x-dynamic-component>
