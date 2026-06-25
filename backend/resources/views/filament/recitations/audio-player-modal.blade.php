<div class="p-4">
    <audio controls class="w-full" autoplay>
        <source src="{{ $audioUrl }}" type="audio/mpeg">
        Your browser does not support the audio element.
    </audio>
    <div class="mt-4 text-center text-gray-600">
        Playing: {{ $surahName }} (Surah {{ $surahId }})
    </div>
</div>
