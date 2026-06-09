import React, { useState } from 'react';
import Flag from 'react-flags';
import { Tooltip, ClickAwayListener } from '@material-ui/core';
import { getCountryName } from '../utils/countryNames';

// Renders a country flag whose full Finnish name appears in a tooltip. The
// tooltip opens on hover (desktop) and on a single tap (mobile) via controlled
// open state, and dismisses on tap-away. The tap does not stop propagation, so
// flags inside clickable containers (e.g. the group overview) still navigate.
const FlagWithName = ({ countryCode, iso2 }) => {
	const [open, setOpen] = useState(false);
	const name = getCountryName(countryCode);
	const flagSize =
		window.innerWidth > 600 ? 64 : window.innerWidth > 330 ? 48 : 32;

	return (
		<ClickAwayListener onClickAway={() => setOpen(false)}>
			<Tooltip
				title={name}
				open={open}
				onClose={() => setOpen(false)}
				onOpen={() => setOpen(true)}
				disableTouchListener
				arrow
			>
				<span onClick={() => setOpen(true)}>
					<Flag
						country={iso2}
						format="png"
						pngSize={64}
						shiny={false}
						alt={name}
						basePath="../img/flags/"
						width={flagSize}
						height={flagSize}
					/>
				</span>
			</Tooltip>
		</ClickAwayListener>
	);
};

export default FlagWithName;
