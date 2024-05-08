const nodoj = {
	k: {},
	remove: (k, getIncr=false) => {
		if (!nodoj.k[k]) return false
		nodoj.k[k].remove()
		for (const key in nodoj.k) {
			if (!document.body.contains(nodoj.k[key])) delete nodoj.k[key]
		}
		if (getIncr) {
			const arr = k.split('_')
			return arr.length === 2 ? arr[1] : -1
		}
		return true
	},
	removeAll: (k, getIncr=false) => { // k is here a key, without "_" and number increment ("_3", for example)
		for (const key in nodoj.k) {
			if (key.startsWith(k)) nodoj.remove(key, getIncr)
		}
	},
	start: (els, node) => nodoj.core(els, node, node.firstChild),
	end: (els, node) => nodoj.core(els, node),
	before: (els, node) => nodoj.core(els, node.parentNode, node),
	after: (els, node) => nodoj.core(els, node.parentNode, node.nextSibling),
	replace: (els, node) => nodoj.core(els, node.parentNode, node, true),
	core: (els, parent=null, ref=null, replace=false, child=false) => {
		const fragment = document.createDocumentFragment()
		if (els.length === 0 && replace) {
			ref.innerHTML = ''
			return
		}
		for (const el of els) {
			if (!el) continue
			if (el.sc) {
				const parts = el.sc.split(/(?=[#.])/)
				let classes = []
				for (const p of parts) {
					if (p.startsWith('#')) {
						el.id = p.slice(1)
					} else if (p.startsWith('.')) {
						classes.push(p.slice(1))
					} else el.tag = p
				}
				if (classes.length > 0) {
					el.className = (el.className || '') + ' ' + classes.join(' ')
				}
			}
			const newNode = el.comment
				? document.createComment(el.comment)
				: document.createElement(el.tag || 'div')
			fragment.appendChild(newNode)
			if (el.k) nodoj.k[el.k] = newNode
			if (el.children) newNode.appendChild(nodoj.core(el.children, newNode, null, false, true))
			for (const key in el) {
				if (key !== 'k' && key !== 'children' && key !== 'tag' && key !== 'sc' && key !== 'comment') {
					const splited = key.split('_')
					if (splited.length === 2) {
						if (splited[0] === 'on') {
							newNode.addEventListener(splited[1], el[key], false)
						} else if (splited[0] === 'data') {
							newNode.dataset[splited[1]] = el[key]
						} else newNode[key] = el[key]
					} else newNode[key] = el[key]
				}
			}
		}
		if (child) return fragment
		replace && ref
			? parent.replaceChild(fragment, ref)
			: parent.insertBefore(fragment, ref || null)
	}
}
export default nodoj // usage: import nodoj from modules/nodoj.js