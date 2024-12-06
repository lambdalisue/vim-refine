if exists('g:loaded_refine')
  finish
endif
let g:loaded_refine = 1

function! s:refine() abort
  let l:reg = getreg('')
  let l:regtype = getregtype('')
  try
    silent! normal! gv""y
    let l:text = getreg('')
    let l:refined = denops#request('refine', 'refine', [l:text])
    if l:refined !=# l:text
      call setreg('', l:refined)
      silent! normal! gv""p
    endif
  finally
    call setreg('', l:reg, l:regtype)
  endtry
endfunction

command! -range -nargs=0 Refine call s:refine()
