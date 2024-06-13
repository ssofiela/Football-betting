import { createTheme } from '@material-ui/core';

export const theme = createTheme({
	palette: {
		chipColor: { gold: '#FFDF00', silver: '#C0C0C0', bronze: '#cd7f32' },
		primary: {
			main: '#27496d'
		},
		secondary: {
			main: '#27496d'
		},
		points: {
			rightAnswer: '#1f6650',
			wrongAnswer: '#c70d3a',
			notPlayed: '#e9e9e9'
		}
	}
});
